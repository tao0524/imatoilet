import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUserToilets, calcDistance } from '../utils';
import '../search.css';

function Search() {
  const navigate = useNavigate();

  const [toilets, setToilets] = useState([]);
  const [filteredToilets, setFilteredToilets] = useState([]);
  
  // フィルタ条件の状態管理
  const [filters, setFilters] = useState({
    wheelchair: false, diaper: false, open24h: false,
    babyChair: false, public: false,
    type_park: false, type_station: false, type_mall: false
  });

  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapObj, setMapObj] = useState(null);
  const markersRef = useRef(null);
  
  const [placeQuery, setPlaceQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const advancedKeys = ["babyChair", "public", "type_park", "type_station", "type_mall"];
  const advCount = advancedKeys.filter(k => filters[k]).length;

  let typeLabel = "未選択";
  if (filters.type_park) typeLabel = "公園";
  if (filters.type_station) typeLabel = "駅・公共施設";
  if (filters.type_mall) typeLabel = "商業施設";

  // 1. APIからデータを取得
  useEffect(() => {
    async function fetchData() {
      let data = [];
      try {
        const res = await fetch('http://localhost:8080/api/toilets');
        const json = await res.json();
        data = [...json];
      } catch (err) {
        console.error("API Error:", err);
      }
      const userData = loadUserToilets();
      data = [...data, ...userData];
      setToilets(data);
      setFilteredToilets(data);
    }
    fetchData();
  }, []);

  // 2. 現在地取得
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

  // 3. ★【重要修正】バックエンドのキャメルケース変数名に対応したフィルタリング
  useEffect(() => {
    let result = toilets.filter(t => {
      // 基本フィルタ
      if (filters.wheelchair && !t.wheelchair) return false;
      if (filters.diaper && !t.diaper) return false;
      if (filters.open24h && !t.open24h) return false;
      
      // 詳細フィルタ（バックエンドの変数名と合わせる）
      if (filters.babyChair && !t.babyChair) return false;
      if (filters.public && !t.publicUse) return false; 
      
      // 場所タイプ（バックエンドの変数名と合わせる）
      const typeSelected = filters.type_park || filters.type_station || filters.type_mall;
      if (typeSelected) {
        if (filters.type_park && t.typePark) return true;
        if (filters.type_station && t.typeStation) return true;
        if (filters.type_mall && t.typeMall) return true;
        return false;
      }
      return true;
    });

    if (currentLocation) {
      result = result.map(t => {
        const dist = calcDistance(currentLocation.lat, currentLocation.lng, t.lat, t.lng);
        return { ...t, distance: dist };
      }).sort((a, b) => a.distance - b.distance);
    }

    setFilteredToilets(result);
  }, [toilets, filters, currentLocation]);

  // 4. 地図初期化
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

  // 5. ピンの描画更新
  useEffect(() => {
    if (!mapObj || !markersRef.current || !window.L) return;
    const layerGroup = markersRef.current;
    layerGroup.clearLayers();

    filteredToilets.forEach(t => {
      if (t.lat && t.lng) {
        const marker = window.L.marker([t.lat, t.lng]).addTo(layerGroup);
        const distStr = t.distance ? `<br>約 ${Math.round(t.distance * 1000)} m` : "";
        
        marker.bindPopup(`
          <b>${t.name}</b>${distStr}<br>
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

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => {
      const next = { ...prev, [name]: checked };
      if (name.startsWith('type_') && checked) {
        if (name !== 'type_park') next.type_park = false;
        if (name !== 'type_station') next.type_station = false;
        if (name !== 'type_mall') next.type_mall = false;
      }
      return next;
    });
  };

  const clearAdvanced = () => {
    setFilters(prev => ({
      ...prev,
      babyChair: false, public: false,
      type_park: false, type_station: false, type_mall: false
    }));
  };

  return (
    <main className="search-main">
      <div className="container">
        {/* UI部分は提供いただいたものと同じです */}
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

        <section className="filters">
          <label><input type="checkbox" name="wheelchair" checked={filters.wheelchair} onChange={handleFilterChange} /> 車椅子対応</label>
          <label><input type="checkbox" name="diaper" checked={filters.diaper} onChange={handleFilterChange} /> オムツ替え</label>
          <label><input type="checkbox" name="open24h" checked={filters.open24h} onChange={handleFilterChange} /> 24時間</label>
        </section>

        <details className="filters-advanced">
          <summary className="filters-advanced__summary">
            詳細内容を選択する（任意）
            <span className="filters-advanced__hint-wrap">
              <span className="filters-advanced__hint">絞り込み：{advCount}件</span>
              <span className="filters-advanced__hint">場所：{typeLabel}</span>
            </span>
          </summary>
          <div className="filters-advanced__body">
            <fieldset className="filters-advanced__group">
              <legend>設備</legend>
              <label className="chip">
                <input type="checkbox" name="babyChair" checked={filters.babyChair} onChange={handleFilterChange} />
                <span>ベビーチェアあり</span>
              </label>
            </fieldset>
            <fieldset className="filters-advanced__group">
              <legend>利用条件</legend>
              <label className="chip">
                <input type="checkbox" name="public" checked={filters.public} onChange={handleFilterChange} />
                <span>誰でも利用可</span>
              </label>
            </fieldset>
            <fieldset className="filters-advanced__group">
              <legend>場所タイプ</legend>
              <label className="chip chip--type">
                <input type="checkbox" name="type_park" checked={filters.type_park} onChange={handleFilterChange} />
                <span>公園</span>
              </label>
              <label className="chip chip--type">
                <input type="checkbox" name="type_station" checked={filters.type_station} onChange={handleFilterChange} />
                <span>駅・公共施設</span>
              </label>
              <label className="chip chip--type">
                <input type="checkbox" name="type_mall" checked={filters.type_mall} onChange={handleFilterChange} />
                <span>商業施設</span>
              </label>
            </fieldset>
            <div className="filters-advanced__actions" style={{ textAlign: 'right' }}>
              <button type="button" className="btn btn-sub" onClick={clearAdvanced}>✖ 詳細条件をクリア</button>
            </div>
          </div>
        </details>

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
