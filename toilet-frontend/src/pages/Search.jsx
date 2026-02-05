import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import '../search.css';
import { API_BASE_URL } from '../config/api';

// アイコン
import SettingsIcon from '@mui/icons-material/Settings';

function Search() {
  const navigate = useNavigate();
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
  const [mapObj, setMapObj] = useState(null);
  const markersRef = useRef(null);
  
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
          if (mapObj) mapObj.setView([lat, lng], 15);
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
        if (mapObj) mapObj.setView([lat, lng], 15);
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
        // 旧タイプフィルタがONなのに、どれもマッチしない場合は除外したいが
        // 既存ロジックに合わせて「他条件がなければ戻す」形にするか、厳密にするか。
        // ここでは「タイプ指定があれば、マッチしなければ除外」とします。
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

  // 5. 地図初期化
  useEffect(() => {
    if (!window.L) return;
    const container = window.L.DomUtil.get('map');
    if (container && container._leaflet_id) container._leaflet_id = null;

    const map = window.L.map('map').setView([36.0825, 140.1120], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const layerGroup = window.L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    setMapObj(map);

    return () => { map.remove(); setMapObj(null); };
  }, []);

  // 6. ピン描画更新
  useEffect(() => {
    if (!mapObj || !markersRef.current || !window.L) return;
    const layerGroup = markersRef.current;
    layerGroup.clearLayers();

    filteredToilets.forEach(t => {
      if (t.lat && t.lng) {
        const marker = window.L.marker([t.lat, t.lng]).addTo(layerGroup);
        const distStr = t.distance ? `<br>約 ${Math.round(t.distance * 1000)} m` : "";
        
        // ピンのポップアップ内容
        marker.bindPopup(`
          <b>${t.name}</b>${distStr}<br>
          <span style="font-size:0.85rem; color:#666;">
            ${t.facilityCategory ? `[${t.facilityCategory}]` : ''} 
            ${t.wheelchair ? '♿' : ''}
            ${t.diaper ? '👶' : ''}
          </span><br>
          <a href="/detail/${t.id}">詳細を見る</a>
        `);
      }
    });
    
    if (currentLocation) {
      window.L.circleMarker([currentLocation.lat, currentLocation.lng], {
        color: '#ff5722', radius: 8, fillColor: '#ff5722', fillOpacity: 0.8
      }).addTo(mapObj).bindPopup("現在地（検索基準）");
    }
  }, [filteredToilets, mapObj, currentLocation]);

  // 条件指定画面へ遷移
  const goConditions = () => {
    navigate('/conditions');
  };

  return (
    <main className="search-main">
      <div className="container">
        
        {/* 目的地検索エリア */}
        <section className="place-search">
          <div className="place-search__row">
            <input 
              type="search" 
              className="input-search"
              placeholder="住所、駅、施設名、郵便番号など" 
              value={placeQuery}
              onChange={(e) => setPlaceQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()}
            />
            <div className="place-search__btns">
              <button className="btn btn-sub" onClick={handlePlaceSearch}>目的地の周辺を検索</button>
              <button className="btn btn-sub" onClick={handleCurrentLocation}>📍 現在地に戻す</button>
            </div>
          </div>
          <p className="place-search__status">{searchStatus}</p>
        </section>

        {/* 条件指定への導線 */}
        <div style={{ margin: '10px 0 24px', padding: '16px', background: '#f0f7ff', borderRadius: '16px', textAlign: 'center' }}>
           <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#444', fontWeight: 'bold' }}>
             条件を指定すると、もっと探しやすくなります<br/>
             <span style={{fontSize: '0.85rem', color: '#666', fontWeight: 'normal'}}>（施設タイプ・オストメイト・授乳室など）</span>
           </p>
           <button
             className="btn btn-secondary"
             onClick={goConditions}
             style={{ background: '#fff', border: '2px solid #1e88e5', color: '#1e88e5', padding: '10px 24px', fontSize: '0.95rem', maxWidth: '300px', margin: '0 auto' }}
           >
             <SettingsIcon fontSize="small" sx={{ mr: 0.5, mb: 0.2 }} /> 条件を指定して探す
           </button>
         </div>

        <div className="search-layout">
          <section className="panel panel--map">
            <header className="panel-head">
              <h2 className="panel-title">地図</h2>
              <div className="panel-meta">ピンをクリックすると詳細を開けます</div>
            </header>
            <div className="map-area">
              <div id="map"></div>
            </div>
          </section>

          <section className="panel panel--list">
            <header className="panel-head">
              <h2 className="panel-title">検索結果</h2>
              <div className="panel-meta">
                並び順：{currentLocation ? "近い順" : "おすすめ順"} / {filteredToilets.length}件
              </div>
            </header>
            <div className="list-area">
              {filteredToilets.map(t => (
                <div key={t.id} className="toilet-card" onClick={() => navigate(`/detail/${t.id}`)}>
                  <div className="toilet-name">{t.name}</div>
                  <div className="toilet-meta">
                    {/* アイコン表示を少し拡張 */}
                    {t.facilityCategory === 'station' && <span title="駅・交通">🚉</span>}
                    {t.facilityCategory === 'commercial' && <span title="商業施設">🛍️</span>}
                    {t.facilityCategory === 'park' && <span title="公園">🌳</span>}
                    
                    {t.wheelchair && <span>♿</span>}
                    {t.diaper && <span>👶</span>}
                    {t.open24h && <span>🕒</span>}
                    
                    {t.distance && <span>📍 約 {Math.round(t.distance * 1000)} m</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Search;