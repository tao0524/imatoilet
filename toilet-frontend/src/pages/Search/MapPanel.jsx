// toilet-frontend/src/pages/Search/MapPanel.jsx
import { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';

// デフォルトの中心位置 (つくば駅周辺)
const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

function MapPanel({ filteredToilets, currentLocation }) {
  // 選択中の（吹き出しを表示する）トイレID
  const [selectedToiletId, setSelectedToiletId] = useState(null);

  // 表示する中心座標の決定
  const center = currentLocation 
    ? { lat: currentLocation.lat, lng: currentLocation.lng }
    : DEFAULT_CENTER;

  // 選択されたトイレデータ
  const selectedToilet = filteredToilets.find(t => t.id === selectedToiletId);

  return (
    <section className="panel panel--map">
      <header className="panel-head">
        <h2 className="panel-title">地図</h2>
        <div className="panel-meta">ピンをクリックすると詳細を開けます</div>
      </header>
      
      <div className="map-area">
        <SafeGoogleMap
          center={center}
          zoom={14}
          style={CONTAINER_STYLE}
        >
          {/* 1. 現在地のマーカー (青い丸などで表現したいが、まずは標準ピンで区別) */}
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title="現在地"
              icon={{
                // 現在地を青いドットで表現
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
            />
          )}

          {/* 2. トイレのマーカー一覧 */}
          {filteredToilets.map((t) => (
            <Marker
              key={t.id}
              position={{ lat: t.lat, lng: t.lng }}
              title={t.name}
              onClick={() => setSelectedToiletId(t.id)}
            />
          ))}

          {/* 3. 情報ウィンドウ (吹き出し) */}
          {selectedToilet && (
            <InfoWindow
              position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
              onCloseClick={() => setSelectedToiletId(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
              <div style={{ padding: '4px', maxWidth: '200px' }}>
                <b style={{ fontSize: '1rem' }}>{selectedToilet.name}</b>
                {selectedToilet.distance && (
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    約 {Math.round(selectedToilet.distance * 1000)} m
                  </div>
                )}
                
                <div style={{ margin: '6px 0', fontSize: '0.85rem', color: '#444' }}>
                  {selectedToilet.facilityCategory && `[${selectedToilet.facilityCategory}] `}
                  {'⭐'.repeat(selectedToilet.cleanliness || 3)}
                </div>

                <div style={{ marginBottom: '8px' }}>
                  {selectedToilet.wheelchair && <span title="車椅子" style={{ marginRight:4 }}>♿</span>}
                  {selectedToilet.diaper && <span title="オムツ" style={{ marginRight:4 }}>👶</span>}
                  {selectedToilet.open24h && <span title="24時間">🕒</span>}
                </div>

                <Link 
                  to={`/detail/${selectedToilet.id}`}
                  style={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    background: '#1e88e5', 
                    color: 'white', 
                    padding: '6px', 
                    borderRadius: '4px', 
                    textDecoration: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  詳細を見る
                </Link>
              </div>
            </InfoWindow>
          )}
        </SafeGoogleMap>
      </div>
    </section>
  );
}

export default MapPanel;