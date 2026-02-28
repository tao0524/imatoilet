// toilet-frontend/src/hooks/useToiletSearch.js
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance, normalizeEquipment } from '../utils'; 
import { API_BASE_URL } from '../config/api';

const HISTORY_KEY = 'imatoilet_search_history';

export const useToiletSearch = () => {
  const [searchParams] = useSearchParams();
  const [filteredToilets, setFilteredToilets] = useState([]);
  const hasInitialized = useRef(false);
  const placeQueryRef = useRef('');

  const [currentLocation, setCurrentLocation] = useState(() => {
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');
    if (urlLat && urlLng) return { lat: parseFloat(urlLat), lng: parseFloat(urlLng), address: '現在地' };
    const saved = sessionStorage.getItem('imatoilet_loc');
    return saved ? JSON.parse(saved) : null;
  });

  const [realLocation, setRealLocation] = useState(() => {
    const urlLat = searchParams.get('lat');
    const urlLng = searchParams.get('lng');
    if (urlLat && urlLng) return { lat: parseFloat(urlLat), lng: parseFloat(urlLng), address: '現在地' };
    const saved = sessionStorage.getItem('imatoilet_realLoc');
    return saved ? JSON.parse(saved) : null;
  });

  const [placeQuery, setPlaceQuery] = useState(() => {
    if (searchParams.has('lat')) return '';
    return sessionStorage.getItem('imatoilet_query') || '';
  });

  const [searchStatus, setSearchStatus] = useState(() => {
    if (searchParams.has('lat')) return '現在地周辺を表示中';
    return sessionStorage.getItem('imatoilet_status') || '';
  });

  const [searchHistory, setSearchHistory] = useState([]);
  const [searchTrigger, setSearchTrigger] = useState(0);
  
  // 選択されたトイレのIDを管理
  const [selectedToiletId, setSelectedToiletId] = useState(null); 
  
  // ★今回追加：地図の表示領域（Bounding Box）を管理
  const [mapBounds, setMapBounds] = useState(null);

  useEffect(() => { placeQueryRef.current = placeQuery; }, [placeQuery]);

  useEffect(() => {
    if (currentLocation) sessionStorage.setItem('imatoilet_loc', JSON.stringify(currentLocation));
    else sessionStorage.removeItem('imatoilet_loc');
  }, [currentLocation]);

  useEffect(() => {
    if (realLocation) sessionStorage.setItem('imatoilet_realLoc', JSON.stringify(realLocation));
    else sessionStorage.removeItem('imatoilet_realLoc');
  }, [realLocation]);

  useEffect(() => { sessionStorage.setItem('imatoilet_query', placeQuery); }, [placeQuery]);
  useEffect(() => { sessionStorage.setItem('imatoilet_status', searchStatus); }, [searchStatus]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setSearchHistory(JSON.parse(raw));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    if (!currentLocation && !searchParams.has('lat') && !searchParams.has('keyword')) {
      handleCurrentLocation();
    }
  }, []);

  const addToHistory = (query) => {
    if (!query) return;
    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(h => h !== query)].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const removeFromHistory = (queryToRemove) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(h => h !== queryToRemove);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const handlePlaceSearch = (overrideQuery) => {
    const query = (typeof overrideQuery === 'string') ? overrideQuery : placeQuery;
    if (!query) return;

    if (!window.google?.maps?.places) {
      setSearchStatus('地図データを読み込み中です。少し待ってから再試行してください');
      return;
    }

    setSearchStatus('Googleマップで場所を解析中...');
    addToHistory(query);

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.textSearch(
      { query, fields: ['name', 'geometry', 'formatted_address', 'rating'] },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length > 0) {
          const hit = results[0];
          const lat = hit.geometry.location.lat();
          const lng = hit.geometry.location.lng();
          setCurrentLocation({ lat, lng, address: hit.formatted_address || hit.name });
          let statusMsg = `「${hit.name}」周辺`;
          if (hit.rating) statusMsg += ` (★${hit.rating})`;
          setSearchStatus(statusMsg + ' を表示中');
        } else {
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
              console.warn('Search failed:', status, geoStatus);
              setSearchStatus('地図上に見つかりません。登録データから検索します...');
              setCurrentLocation(null);
              setSearchTrigger(prev => prev + 1);
            }
          });
        }
      }
    );
  };

  const handleCurrentLocation = () => {
    setSearchStatus('現在地を取得中...');
    if (!navigator.geolocation) {
      setSearchStatus('ブラウザが位置情報に対応していません');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (window.google?.maps?.Geocoder) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            let addr = '現在地';
            if (status === 'OK' && results[0]) {
              addr = results[0].address_components
                .filter(c => c.types.includes('locality') || c.types.includes('sublocality') || c.types.includes('neighborhood'))
                .map(c => c.long_name).reverse().join('') || results[0].formatted_address;
              setSearchStatus(`現在地: ${addr} 付近`);
            } else {
              setSearchStatus('現在地周辺を表示中');
            }
            const loc = { lat, lng, address: addr };
            setCurrentLocation(loc);
            setRealLocation(loc);
          });
        } else {
          const loc = { lat, lng, address: '現在地' };
          setCurrentLocation(loc);
          setRealLocation(loc);
          setSearchStatus('現在地周辺を表示中');
        }
      },
      (err) => {
        console.error(err);
        setSearchStatus('現在地の取得に失敗しました');
      }
    );
  };

  const handleKeywordSearch = () => {
    if (!placeQuery) return;
    addToHistory(placeQuery);
    setSearchStatus('キーワードで登録データを検索中...');
    setCurrentLocation(null);
    setSearchTrigger(prev => prev + 1);
  };

  const handleHistorySearch = (query) => {
    setPlaceQuery(query);
    handlePlaceSearch(query);
  };

  useEffect(() => {
    async function fetchData() {
      const currentPlaceQuery = placeQueryRef.current;
      // ★修正: mapBoundsが存在する場合もフェッチを実行するように条件を緩和
      if (!currentLocation && !currentPlaceQuery && searchTrigger === 0 && !mapBounds) return;

      let apiData = [];
      const isLocationSearch = !!currentLocation || !!mapBounds; // ★追加: bounds検索時もロケーション検索として扱う
      const isKeywordSearch = !currentLocation && !mapBounds;

      try {
        const params = new URLSearchParams();

        // ★修正: mapBoundsがある場合は表示領域検索、ない場合は従来の現在地検索
        if (mapBounds) {
          params.append('minLat', mapBounds.minLat);
          params.append('maxLat', mapBounds.maxLat);
          params.append('minLng', mapBounds.minLng);
          params.append('maxLng', mapBounds.maxLng);
        } else if (currentLocation) {
          params.append('lat', currentLocation.lat);
          params.append('lng', currentLocation.lng);
          params.append('radius', '50.0'); // 初回ロード等、boundsが取得できるまでのフォールバック
        } else {
          if (currentPlaceQuery) params.append('keyword', currentPlaceQuery);
        }

        const facilityCategory = searchParams.get('facilityCategory');
        if (facilityCategory) params.append('facilityCategory', facilityCategory);

        const EQ_KEY_MAP = {
          wheelchair:       'WHEELCHAIR',
          diaper:           'DIAPER',
          open24h:          'OPEN_24H',
          ostomate:         'OSTOMATE',
          nursing_room:     'NURSING_ROOM',
          baby_chair:       'BABY_CHAIR',
          washlet:          'WASHLET',
          visual_support:   'VISUAL_SUPPORT',
          gender_separated: 'GENDER_SEPARATED',
          unisex:           'UNISEX',
          free:             'FREE',
          paid:             'PAID',
          parking:          'PARKING',
        };
        
        Object.entries(EQ_KEY_MAP).forEach(([key, apiName]) => {
          if (searchParams.get(key) === 'true') {
            params.append('equipment', apiName);
          }
        });

        params.append('page', '0');
        // ★修正: 全国スケール対応のため取得上限を増やします（フロントの負荷を考慮し一旦1000件程度に）
        params.append('size', '1000');

        const queryString = params.toString();
        const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;
        
        const res = await fetch(url, { cache: 'no-store' });
        
        if (res.ok) {
          const data = await res.json();
          apiData = data.content || []; 
        } else {
          console.error('API Error');
        }
      } catch (e) {
        console.error('Fetch Error', e);
      }

      const localAll = loadUserToilets();
      let localData = [];
      
      // ★修正: ユーザーが追加したローカルデータも、boundsがあれば画面内に絞り込む
      if (mapBounds) {
        localData = localAll.filter(t => 
          t.lat >= mapBounds.minLat && t.lat <= mapBounds.maxLat &&
          t.lng >= mapBounds.minLng && t.lng <= mapBounds.maxLng
        );
      } else if (isLocationSearch && currentLocation) {
        const cLat = currentLocation.lat;
        const cLng = currentLocation.lng;
        localData = localAll.filter(t => calcDistance(cLat, cLng, t.lat, t.lng) <= 5.0);
      } else {
        localData = localAll;
      }

      const merged = [...apiData, ...localData];

      const filters = {
        facilityCategory:  searchParams.get('facilityCategory') || '',
        minCleanliness:    searchParams.get('minCleanliness') ? parseInt(searchParams.get('minCleanliness'), 10) : 0,
        keyword:           searchParams.get('keyword')?.toLowerCase() || '',
        wheelchair:        searchParams.get('wheelchair')        === 'true',
        diaper:            searchParams.get('diaper')            === 'true',
        open24h:           searchParams.get('open24h')           === 'true',
        public:            searchParams.get('public')            === 'true',
        ostomate:          searchParams.get('ostomate')          === 'true',
        nursing_room:      searchParams.get('nursing_room')      === 'true',
        baby_chair:        searchParams.get('baby_chair')        === 'true',
        washlet:           searchParams.get('washlet')           === 'true',
        visual_support:    searchParams.get('visual_support')    === 'true',
        gender_separated:  searchParams.get('gender_separated')  === 'true',
        unisex:            searchParams.get('unisex')            === 'true',
        free:              searchParams.get('free')              === 'true',
        paid:              searchParams.get('paid')              === 'true',
        parking:           searchParams.get('parking')           === 'true',
      };

      let result = merged.filter(t => {
        if (filters.minCleanliness > 0 && (t.cleanliness || 3) < filters.minCleanliness) return false;
        if (filters.facilityCategory && t.facilityCategory !== filters.facilityCategory) return false;
        if (filters.public && !t.publicUse) return false;
        if (filters.keyword && !isKeywordSearch) {
          if (!(t.name || '').toLowerCase().includes(filters.keyword)) return false;
        }

        const eqSet = normalizeEquipment(t);

        if (filters.wheelchair    && !eqSet.has('WHEELCHAIR'))       return false;
        if (filters.diaper        && !eqSet.has('DIAPER'))           return false;
        if (filters.open24h       && !eqSet.has('OPEN_24H'))         return false;
        if (filters.ostomate      && !eqSet.has('OSTOMATE'))         return false;
        if (filters.nursing_room  && !eqSet.has('NURSING_ROOM'))     return false;
        if (filters.baby_chair    && !eqSet.has('BABY_CHAIR'))       return false;
        if (filters.washlet       && !eqSet.has('WASHLET'))          return false;
        if (filters.visual_support && !eqSet.has('VISUAL_SUPPORT'))  return false;
        if (filters.gender_separated && !eqSet.has('GENDER_SEPARATED')) return false;
        if (filters.unisex        && !eqSet.has('UNISEX'))           return false;
        if (filters.free          && !eqSet.has('FREE'))             return false;
        if (filters.paid          && !eqSet.has('PAID'))             return false;
        if (filters.parking       && !eqSet.has('PARKING'))          return false;

        return true;
      });

      if (isKeywordSearch && currentPlaceQuery) {
        const lowerQ = currentPlaceQuery.toLowerCase();
        result = result.filter(t =>
          (t.name        || '').toLowerCase().includes(lowerQ) ||
          (t.address     || '').toLowerCase().includes(lowerQ) ||
          (t.description || '').toLowerCase().includes(lowerQ)
        );
      }

      if (currentLocation) {
        result = result
          .map(t => ({ ...t, distance: calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng) }))
          .sort((a, b) => a.distance - b.distance);
      }

      const seenIds = new Set();
      const uniqueResult = result.filter(item => {
        if (seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
      });

      setFilteredToilets(uniqueResult);
      setSearchStatus(prev => {
        if (uniqueResult.length > 0) {
          return prev.includes('検索中') || prev.includes('読み込み中')
            ? `${uniqueResult.length}件のトイレが見つかりました`
            : prev;
        }
        return prev.includes('付近') ? prev : '条件に一致するトイレは見つかりませんでした';
      });
    }

    fetchData();
  // ★修正: mapBounds が変わったときにも再フェッチが走るように依存配列に追加
  }, [searchParams, currentLocation, searchTrigger, mapBounds]);

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
    handleHistorySearch,
    removeFromHistory,
    selectedToiletId,
    setSelectedToiletId,
    // ★追加: 戻り値としてエクスポート
    mapBounds,
    setMapBounds
  };
};