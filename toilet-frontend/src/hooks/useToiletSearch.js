import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import { API_BASE_URL } from '../config/api';

const HISTORY_KEY = 'imatoilet_search_history';

export const useToiletSearch = () => {
  const [searchParams] = useSearchParams();

  // --- State ---
  const [filteredToilets, setFilteredToilets] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTrigger, setSearchTrigger] = useState(0);

  // 履歴読み込み
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addToHistory = (query) => {
    if (!query) return;
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // --- Google Maps API を使った強力な検索 ---
  const handlePlaceSearch = async () => {
    if (!placeQuery) return;
    setSearchStatus("Googleマップで場所を解析中...");
    addToHistory(placeQuery);

    if (!window.google || !window.google.maps) {
      setSearchStatus("地図システム準備中...少し待って再試行してください");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));

    try {
      // 戦略: まずは Places API (TextSearch) で曖昧検索を試す
      // 「ラーメン」「スタバ」「東京駅」など、意図を汲み取れる最強の検索
      const placesRequest = {
        query: placeQuery,
        fields: ['name', 'geometry', 'formatted_address', 'rating', 'user_ratings_total'], // 詳細情報も取得
      };

      placesService.textSearch(placesRequest, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          // ベストな結果を採用
          const hit = results[0];
          const lat = hit.geometry.location.lat();
          const lng = hit.geometry.location.lng();
          
          // 詳細情報（評価など）があればステータスに表示
          let statusMsg = `「${hit.name}」周辺`;
          if (hit.rating) {
            statusMsg += ` (★${hit.rating})`;
          }
          statusMsg += " を表示中";

          setCurrentLocation({ lat, lng, address: hit.formatted_address }); // 住所も保持
          setSearchStatus(statusMsg);
          console.log("Places Hit:", hit);

        } else {
          // Placesで見つからない場合、Geocoder（厳密な住所検索）にフォールバック
          console.log("Places failed, trying Geocoder...");
          geocoder.geocode({ address: placeQuery }, (geoResults, geoStatus) => {
            if (geoStatus === 'OK' && geoResults[0]) {
              const hit = geoResults[0];
              const lat = hit.geometry.location.lat();
              const lng = hit.geometry.location.lng();

              setCurrentLocation({ lat, lng, address: hit.formatted_address });
              setSearchStatus(`住所「${hit.formatted_address}」周辺を表示`);
            } else {
              // それでもダメならDB内検索へ
              setSearchStatus("地図上に見つかりません。登録データから検索します...");
              setCurrentLocation(null);
              setSearchTrigger(prev => prev + 1);
            }
          });
        }
      });
    } catch (e) {
      console.error(e);
      setSearchStatus("検索エラー。登録データから探します...");
      setCurrentLocation(null);
      setSearchTrigger(prev => prev + 1);
    }
  };

  // --- 現在地取得 & 逆ジオコーディング (座標→住所) ---
  const handleCurrentLocation = () => {
    setSearchStatus("現在地を取得中...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // 逆ジオコーディング: 座標から「○○市○○町」などの住所を取得
          if (window.google && window.google.maps) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              let addr = "現在地";
              if (status === 'OK' && results[0]) {
                // 読みやすい住所部分を抽出（国名などを省く工夫も可能）
                addr = results[0].address_components
                  .filter(c => c.types.includes('locality') || c.types.includes('sublocality') || c.types.includes('neighborhood'))
                  .map(c => c.long_name).reverse().join('') || results[0].formatted_address;
                setSearchStatus(`現在地: ${addr} 付近`);
              } else {
                setSearchStatus("現在地周辺を表示中");
              }
              setCurrentLocation({ lat, lng, address: addr });
            });
          } else {
            // Google Maps未ロード時
            setCurrentLocation({ lat, lng, address: "現在地" });
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

  // --- キーワード検索（DB直接） ---
  const handleKeywordSearch = () => {
    if (!placeQuery) return;
    addToHistory(placeQuery);
    setSearchStatus("キーワードで登録データを検索中...");
    setCurrentLocation(null);
    setSearchTrigger(prev => prev + 1);
  };

  const handleHistorySearch = (query) => {
    setPlaceQuery(query);
    // State更新を待つためのハック（即時検索したい場合）
    setTimeout(() => {
        // Places検索を実行するか、キーワード検索を実行するか。
        // ここでは「場所検索」ボタンを押したことにする
        const btn = document.querySelector('.btn-icon-side[title="地図移動"]'); 
        if(btn) btn.click();
    }, 100);
  };

  // --- データ取得・フィルタリング (既存ロジック) ---
  useEffect(() => {
    async function fetchData() {
      if (!currentLocation && !placeQuery && searchTrigger === 0) return;

      let apiData = [];
      let isKeywordSearch = !currentLocation; 

      try {
        const params = new URLSearchParams();

        if (currentLocation) {
          params.append('lat', currentLocation.lat);
          params.append('lng', currentLocation.lng);
          params.append('radius', '5.0');
        } else {
          // キーワード検索（お掃除は不要、BackendもLIKE検索なので）
          if (placeQuery) params.append('keyword', placeQuery);
          
          // フィルター条件の適用（中略：既存コードと同じパラメータ処理）
          const filters = {
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
          if (filters.facilityCategory) params.append('facilityCategory', filters.facilityCategory);
          if (filters.wheelchair) params.append('equipment', 'WHEELCHAIR');
          if (filters.diaper) params.append('equipment', 'DIAPER');
          if (filters.open24h) params.append('equipment', 'OPEN_24H');
          if (filters.ostomate) params.append('equipment', 'OSTOMATE');
          if (filters.nursing_room) params.append('equipment', 'NURSING_ROOM');
          if (filters.washlet) params.append('equipment', 'WASHLET');
          if (filters.visual_support) params.append('equipment', 'VISUAL_SUPPORT');
          if (filters.gender_separated) params.append('equipment', 'GENDER_SEPARATED');
          if (filters.unisex) params.append('equipment', 'UNISEX');
          if (filters.free) params.append('equipment', 'FREE');
          if (filters.paid) params.append('equipment', 'PAID');
          if (filters.parking) params.append('equipment', 'PARKING');
        }

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
      
      // クライアントサイドフィルタリング (中略：既存コードと同じ)
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

      if (isKeywordSearch && placeQuery) {
        const lowerQ = placeQuery.toLowerCase(); // お掃除なしでOK
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
        // ステータスが「検索中」のままなら更新
        setSearchStatus(prev => prev.includes('検索中') ? `${result.length}件のトイレが見つかりました` : prev);
      } else {
         if(!searchStatus.includes('付近')) {
            setSearchStatus("条件に一致するトイレは見つかりませんでした");
         }
      }
    }

    fetchData();
  }, [searchParams, currentLocation, searchTrigger]);

  // 初期ロード
  useEffect(() => {
    handleCurrentLocation();
  }, []);

  return {
    filteredToilets,
    currentLocation,
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