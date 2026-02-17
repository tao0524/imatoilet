import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import { API_BASE_URL } from '../config/api';

const HISTORY_KEY = 'imatoilet_search_history';

export const useToiletSearch = () => {
  const [searchParams] = useSearchParams();

  const [filteredToilets, setFilteredToilets] = useState([]);
  
  // 二重実行防止用のガード
  const hasInitialized = useRef(false);

  // ★修正: placeQueryの最新値をrefで保持（useEffect内でクロージャの古い値を参照するのを防ぐ）
  const placeQueryRef = useRef("");

  const [currentLocation, setCurrentLocation] = useState(() => {
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');
    if (urlLat && urlLng) return { lat: parseFloat(urlLat), lng: parseFloat(urlLng), address: "現在地" };
    
    const saved = sessionStorage.getItem('imatoilet_loc');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [realLocation, setRealLocation] = useState(() => {
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');
    if (urlLat && urlLng) return { lat: parseFloat(urlLat), lng: parseFloat(urlLng), address: "現在地" };
    
    const saved = sessionStorage.getItem('imatoilet_realLoc');
    return saved ? JSON.parse(saved) : null;
  });

  const [placeQuery, setPlaceQuery] = useState(() => {
    if (searchParams.has('lat')) return ""; 
    return sessionStorage.getItem('imatoilet_query') || "";
  });
  
  const [searchStatus, setSearchStatus] = useState(() => {
    if (searchParams.has('lat')) return "現在地周辺を表示中";
    return sessionStorage.getItem('imatoilet_status') || "";
  });

  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // ★修正: placeQueryが変わるたびにrefを同期
  useEffect(() => {
    placeQueryRef.current = placeQuery;
  }, [placeQuery]);

  // --- セッション保存 ---
  useEffect(() => {
    if (currentLocation) sessionStorage.setItem('imatoilet_loc', JSON.stringify(currentLocation));
    else sessionStorage.removeItem('imatoilet_loc');
  }, [currentLocation]);

  useEffect(() => {
    if (realLocation) sessionStorage.setItem('imatoilet_realLoc', JSON.stringify(realLocation));
    else sessionStorage.removeItem('imatoilet_realLoc');
  }, [realLocation]);

  useEffect(() => {
    sessionStorage.setItem('imatoilet_query', placeQuery);
  }, [placeQuery]);

  useEffect(() => {
    sessionStorage.setItem('imatoilet_status', searchStatus);
  }, [searchStatus]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch (e) { console.error(e); }
  }, []);

  // --- 初期化ロジック ---
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (!currentLocation && !searchParams.has('lat') && !searchParams.has('keyword')) {
      handleCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 履歴追加
  const addToHistory = (query) => {
    if (!query) return;
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // --- 【修正済み】場所検索 (Classic API / asyncなし) ---
  const handlePlaceSearch = (overrideQuery) => {
    const query = (typeof overrideQuery === 'string') ? overrideQuery : placeQuery;
    if (!query) return;
    
    // API読み込みチェック
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      setSearchStatus("地図データを読み込み中です。少し待ってから再試行してください");
      return;
    }

    setSearchStatus("Googleマップで場所を解析中...");
    addToHistory(query);

    // 1. PlacesService (Classic API) を使用
    // ダミーのdiv要素を渡して初期化（地図インスタンス不要）
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    const request = {
      query: query,
      fields: ['name', 'geometry', 'formatted_address', 'rating'],
    };

    // コールバック方式なので await は使いません
    service.textSearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const hit = results[0];
        const lat = hit.geometry.location.lat();
        const lng = hit.geometry.location.lng();

        setCurrentLocation({ 
          lat, 
          lng, 
          address: hit.formatted_address || hit.name 
        });

        let statusMsg = `「${hit.name}」周辺`;
        if (hit.rating) statusMsg += ` (★${hit.rating})`;
        statusMsg += " を表示中";
        setSearchStatus(statusMsg);
        
      } else {
        // 2. 失敗時は Geocoder にフォールバック
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: query }, (geoResults, geoStatus) => {
          if (geoStatus === 'OK' && geoResults[0]) {
            const geoHit = geoResults[0];
            setCurrentLocation({
              lat: geoHit.geometry.location.lat(),
              lng: geoHit.geometry.location.lng(),
              address: geoHit.formatted_address
            });
            setSearchStatus(`住所「${geoHit.formatted_address}」周辺を表示`);
          } else {
            console.warn("Search failed:", status, geoStatus);
            setSearchStatus("地図上に見つかりません。登録データから検索します...");
            setCurrentLocation(null);
            setSearchTrigger(prev => prev + 1);
          }
        });
      }
    });
  };

  // --- 現在地取得 ---
  const handleCurrentLocation = () => {
    setSearchStatus("現在地を取得中...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              let addr = "現在地";
              if (status === 'OK' && results[0]) {
                addr = results[0].address_components
                  .filter(c => c.types.includes('locality') || c.types.includes('sublocality') || c.types.includes('neighborhood'))
                  .map(c => c.long_name).reverse().join('') || results[0].formatted_address;
                setSearchStatus(`現在地: ${addr} 付近`);
              } else {
                setSearchStatus("現在地周辺を表示中");
              }
              const loc = { lat, lng, address: addr };
              setCurrentLocation(loc);
              setRealLocation(loc);
            });
          } else {
            const loc = { lat, lng, address: "現在地" };
            setCurrentLocation(loc);
            setRealLocation(loc);
            setSearchStatus("現在地周辺を表示中");
          }
        },
        (err) => {
          console.error(err);
          setSearchStatus("現在地の取得に失敗しました");
        }
      );
    } else {
      setSearchStatus("ブラウザが位置情報に対応していません");
    }
  };

  const handleKeywordSearch = () => {
    if (!placeQuery) return;
    addToHistory(placeQuery);
    setSearchStatus("キーワードで登録データを検索中...");
    setCurrentLocation(null);
    setSearchTrigger(prev => prev + 1);
  };

  // --- 【修正済み】履歴検索 (直接呼び出し) ---
  const handleHistorySearch = (query) => {
    setPlaceQuery(query);
    // DOM操作ではなく、直接関数を呼び出します
    handlePlaceSearch(query);
  };

  // --- データ取得 ---
  useEffect(() => {
    async function fetchData() {
      // ★修正: placeQueryはrefから取得（依存配列に含めなくても最新値を参照できる）
      const currentPlaceQuery = placeQueryRef.current;

      if (!currentLocation && !currentPlaceQuery && searchTrigger === 0) return;

      let apiData = [];
      let isKeywordSearch = !currentLocation; 

      try {
        const params = new URLSearchParams();

        if (currentLocation) {
          params.append('lat', currentLocation.lat);
          params.append('lng', currentLocation.lng);
          params.append('radius', '5.0');
        } else {
          if (currentPlaceQuery) params.append('keyword', currentPlaceQuery);
        }

        // フィルタパラメータを位置情報の有無にかかわらず共通で付与
        const apiFilters = {
          facilityCategory: searchParams.get('facilityCategory'),
          wheelchair: searchParams.get('wheelchair') === 'true',
          diaper: searchParams.get('diaper') === 'true',
          open24h: searchParams.get('open24h') === 'true',
          ostomate: searchParams.get('ostomate') === 'true',
          nursing_room: searchParams.get('nursing_room') === 'true',
          washlet: searchParams.get('washlet') === 'true',
          visual_support: searchParams.get('visual_support') === 'true',
          gender_separated: searchParams.get('gender_separated') === 'true',
          unisex: searchParams.get('unisex') === 'true',
          free: searchParams.get('free') === 'true',
          paid: searchParams.get('paid') === 'true',
          parking: searchParams.get('parking') === 'true'
        };

        if (apiFilters.facilityCategory) params.append('facilityCategory', apiFilters.facilityCategory);
        if (apiFilters.wheelchair) params.append('equipment', 'WHEELCHAIR');
        if (apiFilters.diaper) params.append('equipment', 'DIAPER');
        if (apiFilters.open24h) params.append('equipment', 'OPEN_24H');
        if (apiFilters.ostomate) params.append('equipment', 'OSTOMATE');
        if (apiFilters.nursing_room) params.append('equipment', 'NURSING_ROOM');
        if (apiFilters.washlet) params.append('equipment', 'WASHLET');
        if (apiFilters.visual_support) params.append('equipment', 'VISUAL_SUPPORT');
        if (apiFilters.gender_separated) params.append('equipment', 'GENDER_SEPARATED');
        if (apiFilters.unisex) params.append('equipment', 'UNISEX');
        if (apiFilters.free) params.append('equipment', 'FREE');
        if (apiFilters.paid) params.append('equipment', 'PAID');
        if (apiFilters.parking) params.append('equipment', 'PARKING');

        const queryString = params.toString();
        const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

        const res = await fetch(url);
        if (res.ok) {
          apiData = await res.json();
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
      }

      const localData = loadUserToilets();
      const merged = [...apiData, ...localData];
      
      // ローカルデータに対してのフィルタリング（APIデータはサーバー側でフィルタ済み）
      const filters = {
        wheelchair: searchParams.get('wheelchair') === 'true',
        diaper: searchParams.get('diaper') === 'true',
        open24h: searchParams.get('open24h') === 'true',
        public: searchParams.get('public') === 'true',
        babyChair: searchParams.get('babyChair') === 'true',
        facilityCategory: searchParams.get('facilityCategory') || '',
        ostomate: searchParams.get('ostomate') === 'true',
        nursing_room: searchParams.get('nursing_room') === 'true',
        washlet: searchParams.get('washlet') === 'true',
        visual_support: searchParams.get('visual_support') === 'true',
        gender_separated: searchParams.get('gender_separated') === 'true',
        unisex: searchParams.get('unisex') === 'true',
        free: searchParams.get('free') === 'true',
        paid: searchParams.get('paid') === 'true',
        parking: searchParams.get('parking') === 'true',
      };

      let result = merged.filter(t => {
          if (filters.wheelchair && !t.wheelchair) return false;
          if (filters.diaper && !t.diaper) return false;
          if (filters.open24h && !t.open24h) return false;
          if (filters.public && !t.publicUse) return false;
          if (filters.facilityCategory && (!t.facilityCategory || t.facilityCategory !== filters.facilityCategory)) return false;
          const eqStr = t.equipment || ""; 
          if (filters.ostomate && !eqStr.includes('ostomate')) return false;
          if (filters.nursing_room && !eqStr.includes('nursing_room')) return false;
          if (filters.washlet && !eqStr.includes('washlet')) return false;
          if (filters.visual_support && !eqStr.includes('visual_support')) return false;
          if (filters.gender_separated && !eqStr.includes('gender_separated')) return false;
          if (filters.unisex && !eqStr.includes('unisex')) return false;
          if (filters.free && !eqStr.includes('free')) return false;
          if (filters.paid && !eqStr.includes('paid')) return false;
          if (filters.parking && !eqStr.includes('parking')) return false;
          return true;
      });

      if (isKeywordSearch && currentPlaceQuery) {
        const lowerQ = currentPlaceQuery.toLowerCase(); 
        result = result.filter(t => {
          const n = (t.name || "").toLowerCase();
          const a = (t.address || "").toLowerCase();
          const d = (t.description || "").toLowerCase();
          return n.includes(lowerQ) || a.includes(lowerQ) || d.includes(lowerQ);
        });
      }

      if (currentLocation) {
        result = result.map(t => {
          const dist = calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng);
          return { ...t, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
      }

      setFilteredToilets(result);

      if (result.length > 0) {
        setSearchStatus(prev => prev.includes('検索中') || prev.includes('読み込み中') ? `${result.length}件のトイレが見つかりました` : prev);
      } else {
        // ★修正: searchStatusをコールバック形式で参照（依存配列に含めなくても最新値を使える）
        setSearchStatus(prev => {
          if (!prev.includes('付近')) {
            return "条件に一致するトイレは見つかりませんでした";
          }
          return prev;
        });
      }
    }

    fetchData();
  }, [searchParams, currentLocation, searchTrigger]); 

  return {
    filteredToilets,
    currentLocation,
    realLocation,
    placeQuery,
    setPlaceQuery,
    searchStatus,
    handlePlaceSearch,
    handleCurrentLocation,
    handleKeywordSearch,
    searchHistory,
    handleHistorySearch
  };
};