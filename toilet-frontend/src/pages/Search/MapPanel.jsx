import { useEffect, useRef, useState } from 'react';

function MapPanel({ filteredToilets, currentLocation }) {
  const [mapObj, setMapObj] = useState(null);
  const markersRef = useRef(null);

  // 地図初期化
  useEffect(() => {
    if (!window.L) return;
    
    // 既に地図がある場合はクリーンアップ（通常はReactのstrict mode等で2回呼ばれるのを防ぐ）
    const container = window.L.DomUtil.get('map');
    if (container && container._leaflet_id) {
        container._leaflet_id = null;
    }

    const map = window.L.map('map').setView([36.0825, 140.1120], 13);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const layerGroup = window.L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    setMapObj(map);

    return () => {
      map.remove();
      setMapObj(null);
    };
  }, []);

  // ピン描画更新
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
      
      // 現在地が変わったらそこを中心に移動
      mapObj.setView([currentLocation.lat, currentLocation.lng], 15);
    }
  }, [filteredToilets, mapObj, currentLocation]);

  return (
    <section className="panel panel--map">
      <header className="panel-head">
        <h2 className="panel-title">地図</h2>
        <div className="panel-meta">ピンをクリックすると詳細を開けます</div>
      </header>
      <div className="map-area">
        <div id="map"></div>
      </div>
    </section>
  );
}

export default MapPanel;