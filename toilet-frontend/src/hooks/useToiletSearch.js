import { useState, useEffect, useRef } from 'react';
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

  // ★追加: 検索を強制的に実行するためのトリガー
  const [searchTrigger, setSearchTrigger] = useState(0);

  // 住所のお掃除関数
  const cleanSearchTerm = (text) => {
    if (!text) return "";
    return text
      .replace(/〒/g, '')
      .replace(/\d{3}-\d{4}/g, '') // 郵便番号削除
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/[\s　]+/g, ' ')
      .trim();
  };

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

  // --- 検索実行ロジック ---
  useEffect(() => {
    async function fetchData() {
      // 初期ロード時など、条件がない場合は何もしない（現在地取得待ち）
      if (!currentLocation && !placeQuery && searchTrigger === 0) return;

      let apiData = [];
      let isKeywordSearch = !currentLocation; // 現在地がnullならキーワード検索モード

      try {
        const params = new URLSearchParams();

        if (currentLocation) {
          // 地図（半径）検索
          params.append('lat', currentLocation.lat);
          params.append('lng', currentLocation.lng);
          params.append('radius', '5.0');
          console.log(`🔍 Radius search: ${currentLocation.lat}, ${currentLocation.lng}`);
        } else {
          // キーワード検索
          if (placeQuery) {
            const cleaned = cleanSearchTerm(placeQuery);
            params.append('keyword', cleaned);
            console.log(`🔍 Keyword search: ${cleaned}`);
          }
          
          // フィルター条件の適用
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
          eqList.forEach(eq => params.append('equipment', eq));
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

      // ローカルデータ結合
      const localData = loadUserToilets();
      const merged = [...apiData, ...localData];
      
      // クライアントサイドフィルタリング
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
        // 旧仕様
        type_park: searchParams.get('type_park') === 'true',
        type_station: searchParams.get('type_station') === 'true',
        type_mall: searchParams.get('type_mall') === 'true',
      };

      let result = merged.filter(t => {
          if (filters.wheelchair && !t.wheelchair) return false;
          if (filters.diaper && !t.diaper) return false;
          if (filters.open24h && !t.open24h) return false;
          if (filters.public && !t.publicUse) return false;
          
          if (filters.babyChair) {
            const eqStr = (t.equipment || "").toLowerCase();
            if (!eqStr.includes('baby_chair') && !eqStr.includes('babychair')) return false;
          }

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

      // キーワード検索時の追加フィルタ（念のため）
      if (isKeywordSearch && placeQuery) {
        const lowerQ = cleanSearchTerm(placeQuery).toLowerCase();
        result = result.filter(t => {
          const n = (t.name || "").toLowerCase();
          const a = (t.address || "").toLowerCase();
          const d = (t.description || "").toLowerCase();
          return n.includes(lowerQ) || a.includes(lowerQ) || d.includes(lowerQ);
        });
      }

      // 距離計算とソート
      if (currentLocation) {
        result = result.map(t => {
          const dist = calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng);
          return { ...t, distance: dist };
        }).sort((a, b) => a.distance - b.distance);
      }

      setFilteredToilets(result);

      // ステータス更新（ここで「検索中」を上書き）
      if (result.length > 0) {
        setSearchStatus(`${result.length}件のトイレが見つかりました`);
      } else {
        if (isKeywordSearch) {
          setSearchStatus("条件に一致するトイレは見つかりませんでした");
        } else {
          setSearchStatus("この周辺には登録されたトイレがありません");
        }
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentLocation, searchTrigger]); // ★ placeQueryの代わりにtriggerを監視


  // --- ハンドラ群 ---

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
          setSearchStatus("現在地周辺を表示します...");
        },
        (err) => {
          setSearchStatus("現在地の取得に失敗しました");
        }
      );
    } else {
      setSearchStatus("ブラウザが位置情報に対応していません");
    }
  };

  // ★修正: 地図検索の再試行ロジック
  const handlePlaceSearch = async () => {
    if (!placeQuery) return;
    setSearchStatus("地図を検索中...");
    addToHistory(placeQuery);

    const performSearch = async (queryText) => {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data && data.length > 0 ? data[0] : null;
    };

    try {
      // 1. まずは「お掃除」した住所で検索
      let cleanQ = cleanSearchTerm(placeQuery);
      let hit = await performSearch(cleanQ);

      // 2. 見つからない場合、後ろの番号（1-1など）を削除して再検索（これが重要！）
      if (!hit) {
        // 例: "つくば市研究学園1-1" -> "つくば市研究学園"
        const retryQ = cleanQ.replace(/[\d]+[-−]\d+.*$/, '').trim();
        // 削りすぎて空にならないか確認
        if (retryQ && retryQ !== cleanQ) {
           console.log(`Retrying map search with: ${retryQ}`);
           hit = await performSearch(retryQ);
        }
      }

      if (hit) {
        const lat = parseFloat(hit.lat);
        const lng = parseFloat(hit.lon);
        setCurrentLocation({ lat, lng });
        setSearchStatus(`「${hit.display_name.split(',')[0]}」周辺を表示`);
      } else {
        // 3. それでもダメならキーワード検索へ
        console.log("Map search failed completely. Fallback.");
        setSearchStatus("地図上に見つかりません。登録データから検索します...");
        setCurrentLocation(null);
        setSearchTrigger(prev => prev + 1); // 強制検索
      }
    } catch (e) {
      console.error(e);
      setSearchStatus("エラー発生。登録データから検索します...");
      setCurrentLocation(null);
      setSearchTrigger(prev => prev + 1);
    }
  };

  // キーワード検索（ボタン押下）
  const handleKeywordSearch = () => {
    if (!placeQuery) return;
    addToHistory(placeQuery);
    setSearchStatus("キーワードで検索中...");
    setCurrentLocation(null);
    setSearchTrigger(prev => prev + 1); // ★ここが重要：同じ条件でも強制的に検索を走らせる
  };

  const handleHistorySearch = (query) => {
    setPlaceQuery(query);
    // State更新待ちを防ぐため、少し待つか、useEffect依存を利用するが、
    // ここではシンプルにtriggerは押さない（ユーザーがボタンを押すフローにする）か、
    // 即時検索したい場合は以下のようにする
    setTimeout(() => {
        // 次のレンダリングで検索させるため簡易的に実装
        const btn = document.querySelector('.place-search .btn-primary'); 
        if(btn) btn.click();
    }, 100);
  };

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