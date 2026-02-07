import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import { API_BASE_URL } from '../config/api';

export const useToiletSearch = () => {
  const [searchParams] = useSearchParams();

  // --- State ---
  // 最終的に表示するトイレリスト
  const [filteredToilets, setFilteredToilets] = useState([]);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // --- 1. 検索条件の取得 (URLパラメータから) ---
  const filters = {
    // 既存フィルター (Booleanフラグ)
    wheelchair: searchParams.get('wheelchair') === 'true',
    diaper: searchParams.get('diaper') === 'true',
    open24h: searchParams.get('open24h') === 'true',
    babyChair: searchParams.get('babyChair') === 'true', // DBカラム無し、文字列判定で対応
    public: searchParams.get('public') === 'true',
    type_park: searchParams.get('type_park') === 'true',
    type_station: searchParams.get('type_station') === 'true',
    type_mall: searchParams.get('type_mall') === 'true',

    // 新設計フィルター
    facilityCategory: searchParams.get('facilityCategory') || '',

    // 詳細設備
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

  // --- 2. クライアントサイド・フィルタリングロジック ---
  // バックエンド検索の漏れ防止 & LocalStorageデータ用
  const applyClientSideFilters = (sourceData) => {
    return sourceData.filter(t => {
      // (A) 既存フラグのチェック
      if (filters.wheelchair && !t.wheelchair) return false;
      if (filters.diaper && !t.diaper) return false;
      if (filters.open24h && !t.open24h) return false;
      if (filters.public && !t.publicUse) return false;
      
      // babyChair対応 (DBカラムがないため equipment 文字列から判定)
      if (filters.babyChair) {
        const eqStr = (t.equipment || "").toLowerCase();
        // baby_chair, babychair などの表記揺れに対応
        if (!eqStr.includes('baby_chair') && !eqStr.includes('babychair')) return false;
      }

      // (B) 場所タイプ (旧仕様) - 論理バグ修正済み
      const typeSelected = filters.type_park || filters.type_station || filters.type_mall;
      if (typeSelected) {
        // どれか一つにマッチすればOKだが、マッチしない場合は除外
        const matchesType = 
          (filters.type_park && t.typePark) ||
          (filters.type_station && t.typeStation) ||
          (filters.type_mall && t.typeMall);
        
        if (!matchesType) return false;
      }

      // (C) 新・施設カテゴリのチェック
      if (filters.facilityCategory) {
        if (!t.facilityCategory || t.facilityCategory !== filters.facilityCategory) {
          return false;
        }
      }

      // (D) 新・詳細設備のチェック (t.equipment CSV文字列)
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
  };

  // --- 3. データ取得ロジック (API + LocalStorage) ---
  useEffect(() => {
    async function fetchData() {
      let apiData = [];
      
      try {
        const params = new URLSearchParams();

        // 3-1. パラメータの構築
        if (currentLocation) {
          // 現在地がある場合は「半径検索」APIを使用
          params.append('lat', currentLocation.lat);
          params.append('lng', currentLocation.lng);
          params.append('radius', '5.0'); // バックエンドのデフォルトに合わせる
          
          console.log(`🔍 Radius search mode: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)} (5km)`);
        } else {
          // 現在地がない場合は「条件検索」APIを使用
          
          // (a) カテゴリ
          if (filters.facilityCategory) {
            params.append('facilityCategory', filters.facilityCategory);
          }

          // (b) 設備リスト（BackendのEquipmentType Enumに合わせて変換）
          const eqList = [];
          if (filters.wheelchair) eqList.push('WHEELCHAIR');
          if (filters.diaper) eqList.push('DIAPER');
          if (filters.open24h) eqList.push('OPEN_24H');
          if (filters.ostomate) eqList.push('OSTOMATE');
          if (filters.nursing_room) eqList.push('NURSING_ROOM');
          if (filters.washlet) eqList.push('WASHLET');
          if (filters.visual_support) eqList.push('VISUAL_SUPPORT');
          if (filters.gender_separated) eqList.push('GENDER_SEPARATED');
          if (filters.unisex) eqList.push('UNISEX');
          if (filters.free) eqList.push('FREE');
          if (filters.paid) eqList.push('PAID');
          if (filters.parking) eqList.push('PARKING');

          // 配列をループしてパラメータに追加
          eqList.forEach(eq => params.append('equipment', eq));
          
          console.log(`🔍 Condition search mode: equipment filters = [${eqList.join(', ')}]`);
        }

        // 3-2. APIリクエスト
        const queryString = params.toString();
        const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

        console.log(`🌐 Fetching from: ${url}`);
        const res = await fetch(url);
        
        if (res.ok) {
          apiData = await res.json();
          console.log(`✅ API returned ${apiData.length} toilets`);
        } else {
          console.error("API response not ok");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
      }

      // 3-3. ローカルデータの取得
      const localData = loadUserToilets();
      console.log(`📦 LocalStorage: ${localData.length} toilets`);

      // 3-4. データの結合と最終フィルタリング
      const merged = [...apiData, ...localData];
      let result = applyClientSideFilters(merged);
      
      console.log(`🔧 Client-side filters applied: ${merged.length} → ${result.length} toilets`);

      // 3-5. 距離計算とソート
      if (currentLocation) {
        result = result.map(t => {
          const dist = calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng);
          return { ...t, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
        
        if (result.length > 0) {
           console.log(`📍 Sorted by distance: nearest = ${result[0].distance.toFixed(2)}km`);
        }
      }

      setFilteredToilets(result);
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentLocation]); // URL条件か現在地が変わったら再取得


  // --- 4. 現在地・住所検索ハンドラ ---
  
  // マウント時に自動で現在地を取得（既存仕様の維持）
  useEffect(() => {
    handleCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 現在地取得
  const handleCurrentLocation = () => {
    setSearchStatus("現在地を取得中...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation({ lat, lng });
          setSearchStatus("現在地を表示しました");
          console.log(`📍 Current location acquired: ${lat}, ${lng}`);
        },
        (err) => {
          setSearchStatus("現在地の取得に失敗しました");
          console.error("Geolocation error:", err);
        }
      );
    } else {
      setSearchStatus("お使いのブラウザは位置情報に対応していません");
    }
  };

  // 住所・施設名検索 (Nominatim)
  const handlePlaceSearch = async () => {
    if (!placeQuery) return;
    setSearchStatus("検索中...");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const hit = data[0];
        const lat = parseFloat(hit.lat);
        const lng = parseFloat(hit.lon);
        setCurrentLocation({ lat, lng });
        setSearchStatus(`「${hit.display_name.split(',')[0]}」周辺を表示`);
      } else {
        setSearchStatus("見つかりませんでした");
      }
    } catch (e) {
      setSearchStatus("検索エラーが発生しました");
    }
  };

  return {
    filteredToilets,
    currentLocation,
    placeQuery,
    setPlaceQuery,
    searchStatus,
    handlePlaceSearch,
    handleCurrentLocation
  };
};