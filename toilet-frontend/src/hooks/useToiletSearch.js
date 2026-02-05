import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import { API_BASE_URL } from '../config/api';

export const useToiletSearch = () => {
  const [searchParams] = useSearchParams();

  const [toilets, setToilets] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  
  // --- 1. 検索条件の取得 (URLパラメータから) ---
  const filters = {
    // 既存フィルター (Booleanフラグ)
    wheelchair: searchParams.get('wheelchair') === 'true',
    diaper: searchParams.get('diaper') === 'true',
    open24h: searchParams.get('open24h') === 'true',
    babyChair: searchParams.get('babyChair') === 'true',
    public: searchParams.get('public') === 'true',
    type_park: searchParams.get('type_park') === 'true',
    type_station: searchParams.get('type_station') === 'true',
    type_mall: searchParams.get('type_mall') === 'true',

    // --- 新設計フィルター (追加) ---
    // 施設カテゴリ (文字列: station, commercial 等)
    facilityCategory: searchParams.get('facilityCategory') || '',

    // 詳細設備 (新項目は t.equipment 文字列内を検索する)
    ostomate: searchParams.get('ostomate') === 'true',
    nursing_room: searchParams.get('nursing_room') === 'true',
    washlet: searchParams.get('washlet') === 'true',
    visual_support: searchParams.get('visual_support') === 'true',
    gender_separated: searchParams.get('gender_separated') === 'true',
    unisex: searchParams.get('unisex') === 'true',
    free: searchParams.get('free') === 'true',
    paid: searchParams.get('paid') === 'true'
  };

  const [currentLocation, setCurrentLocation] = useState(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  // 2. APIからデータを取得
  useEffect(() => {
    async function fetchData() {
      let data = [];
      try {
        const res = await fetch(API_BASE_URL);
        const json = await res.json();
        data = [...json];
      } catch (err) {
        console.error("API Error:", err);
      }
      const userData = loadUserToilets();
      data = [...data, ...userData];
      setToilets(data);
      // ここでは setFilteredToilets しない（下の useEffect でフィルタリングされるため）
    }
    fetchData();
  }, []);

  // 3. 現在地取得
  useEffect(() => {
    handleCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCurrentLocation = () => {
    setSearchStatus("現在地を取得中...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setCurrentLocation({ lat, lng });
          setSearchStatus("現在地を表示しました");
          // mapObj.setView は MapPanel 側で currentLocation の変化を検知して行う
        },
        (err) => setSearchStatus("現在地の取得に失敗しました")
      );
    }
  };

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
        // mapObj.setView は MapPanel 側で行う
      } else {
        setSearchStatus("見つかりませんでした");
      }
    } catch (e) {
      setSearchStatus("検索エラーが発生しました");
    }
  };

  // --- 4. フィルタリング処理（filtersが変わるたびに実行） ---
  useEffect(() => {
    let result = toilets.filter(t => {
      // (A) 既存フラグのチェック
      if (filters.wheelchair && !t.wheelchair) return false;
      if (filters.diaper && !t.diaper) return false;
      if (filters.open24h && !t.open24h) return false;
      if (filters.babyChair && !t.babyChair) return false;
      if (filters.public && !t.publicUse) return false; 
      
      // 場所タイプ (旧仕様)
      const typeSelected = filters.type_park || filters.type_station || filters.type_mall;
      if (typeSelected) {
        if (filters.type_park && t.typePark) return true;
        if (filters.type_station && t.typeStation) return true;
        if (filters.type_mall && t.typeMall) return true;
        // 旧タイプフィルタがONなのに、どれもマッチしない場合は除外
        if (!filters.type_park && !filters.type_station && !filters.type_mall) {
            // ここには来ない
        } else {
            // どれか一つでもHITすればOKだが、ここまで来た時点でHITしていない
            return false;
        }
      }

      // (B) 新・施設カテゴリのチェック (facilityCategory)
      if (filters.facilityCategory) {
        // データ側に facilityCategory がない、または一致しない場合は除外
        if (!t.facilityCategory || t.facilityCategory !== filters.facilityCategory) {
          return false;
        }
      }

      // (C) 新・詳細設備のチェック (t.equipment 文字列に含まれるか)
      // equipment は "wheelchair,ostomate,washlet" のようなカンマ区切り文字列を想定
      const eqStr = t.equipment || ""; // null対策

      if (filters.ostomate && !eqStr.includes('ostomate')) return false;
      if (filters.nursing_room && !eqStr.includes('nursing_room')) return false;
      if (filters.washlet && !eqStr.includes('washlet')) return false;
      if (filters.visual_support && !eqStr.includes('visual_support')) return false;
      if (filters.gender_separated && !eqStr.includes('gender_separated')) return false;
      if (filters.unisex && !eqStr.includes('unisex')) return false;
      if (filters.free && !eqStr.includes('free')) return false;
      if (filters.paid && !eqStr.includes('paid')) return false;

      return true;
    });

    // 距離順ソート
    if (currentLocation) {
      result = result.map(t => {
        const dist = calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng);
        return { ...t, distance: dist };
      }).sort((a, b) => a.distance - b.distance);
    }

    setFilteredToilets(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toilets, searchParams, currentLocation]); 

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