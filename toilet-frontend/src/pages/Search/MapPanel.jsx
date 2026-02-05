import { useEffect, useRef, useState } from 'react';

function MapPanel({ filteredToilets, currentLocation }) {
  const [mapObj, setMapObj] = useState(null);
  const markersRef = useRef(null);

  // 1. 地図の初期化処理
  useEffect(() => {
    // Leafletが読み込まれていない、または既に地図がある場合は何もしない
    if (!window.L || mapObj) return;

    // 地図を表示する領域(DOM)があるか確認
    const container = document.getElementById('map');
    if (!container) return;

    // ★修正点: 無理やりIDを消す裏技コード(_leaflet_id = null)を削除しました

    // 地図インスタンスを作成
    const map = window.L.map('map').setView([36.0825, 140.1120], 13);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);

    const layerGroup = window.L.layerGroup().addTo(map);
    markersRef.current = layerGroup;
    setMapObj(map);

    // ★重要: Reactのクリーンアップ機能（コンポーネントが消える時に実行される）
    return () => {
      if (map) {
        map.remove(); // 地図を正しく破棄する
      }
      setMapObj(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // 2. ピン（マーカー）の描画更新
  useEffect(() => {
    if (!mapObj || !markersRef.current || !window.L) return;
    
    const layerGroup = markersRef.current;
    layerGroup.clearLayers(); // 既存のピンを一度消す

    // トイレのピンを立てる
    filteredToilets.forEach(t => {
      if (t.lat && t.lng) {
        const marker = window.L.marker([t.lat, t.lng]).addTo(layerGroup);
        const distStr = t.distance ? `<br>約 ${Math.round(t.distance * 1000)} m` : "";
        
        // ピンをクリックした時のポップアップ
        marker.bindPopup(`
          <b>${t.name}</b>${distStr}<br>
          <span style="font-size:0.85rem; color:#666;">
            ${t.facilityCategory ? `[${t.facilityCategory}]` : ''} 
            ${t.cleanliness ? '⭐'.repeat(t.cleanliness) : ''}
          </span><br>
          <div style="margin-top:4px;">
            ${t.wheelchair ? '♿' : ''}
            ${t.diaper ? '👶' : ''}
          </div>
          <a href="/detail/${t.id}" style="display:inline-block; margin-top:4px;">詳細を見る</a>
        `);
      }
    });
    
    // 現在地の表示
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