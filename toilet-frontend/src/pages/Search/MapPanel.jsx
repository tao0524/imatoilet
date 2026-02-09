// toilet-frontend/src/pages/Search/MapPanel.jsx
import { useState } from 'react';
import { Marker, InfoWindow } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';

const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

/**
 * トイレのピンアイコン生成関数（改善版）
 * 施設タイプをベースにしつつ、車椅子対応なら「バッジ」を付与する
 */
const getPinIcon = (toilet) => {
  // 1. デフォルト設定 (その他)
  let color = '#757575'; // グレー
  let text = '🚽';

  // 2. 施設カテゴリに基づいて色とアイコンを決める
  switch (toilet.facilityCategory) {
    case 'station':
      color = '#ef5350'; // 赤
      text = '🚉';
      break;
    case 'park':
      color = '#43a047'; // 緑
      text = '🌳';
      break;
    case 'commercial':
    case 'convenience':
      color = '#fb8c00'; // オレンジ
      text = '🛍️';
      break;
    case 'public':
      color = '#3949ab'; // インディゴ
      text = '🏢';
      break;
    case 'medical':
      color = '#e91e63'; // ピンク
      text = '🏥';
      break;
    case 'hotel_tourism':
      color = '#8e24aa'; // 紫
      text = '🏨';
      break;
    default:
      // デフォルトのまま
      break;
  }

  // 3. 車椅子対応バッジの生成 (SVG)
  // 右上(cx=32, cy=8)に青い円と車椅子マークを描画
  const wheelchairBadge = toilet.wheelchair ? `
    <circle cx="32" cy="10" r="9" fill="#1976d2" stroke="white" stroke-width="1.5" />
    <text x="32" y="14" font-size="11" text-anchor="middle" fill="white" font-family="sans-serif">♿</text>
  ` : '';

  // 4. SVG全体の組み立て
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
      <path fill="${color}" d="M20 2C8.95 2 0 10.95 0 22c0 10.5 17 26 19 27.8a1.5 1.5 0 0 0 2 0C23 48 40 32.5 40 22 40 10.95 31.05 2 20 2z" />
      
      <circle cx="20" cy="22" r="14" fill="white" opacity="0.3" />
      
      <text x="20" y="29" font-size="20" text-anchor="middle" fill="white" font-family="Segoe UI, sans-serif">${text}</text>

      ${wheelchairBadge}
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function MapPanel({ filteredToilets, currentLocation }) {
  const [selectedToiletId, setSelectedToiletId] = useState(null);

  const center = currentLocation 
    ? { lat: currentLocation.lat, lng: currentLocation.lng }
    : DEFAULT_CENTER;

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
          {/* 現在地 */}
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title="現在地"
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              zIndex={999}
            />
          )}

          {/* トイレマーカー */}
          {filteredToilets.map((t) => (
            <Marker
              key={t.id}
              position={{ lat: t.lat, lng: t.lng }}
              title={t.name}
              icon={{
                url: getPinIcon(t),
                scaledSize: { width: 44, height: 52 }, // バッジ分少し大きく
                anchor: { x: 20, y: 52 } // ピンの先端を座標に合わせる
              }}
              onClick={() => setSelectedToiletId(t.id)}
            />
          ))}

          {/* 吹き出し */}
          {selectedToilet && (
            <InfoWindow
              position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
              onCloseClick={() => setSelectedToiletId(null)}
              options={{ pixelOffset: { width: 0, height: -52 } }}
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
                    display: 'block', textAlign: 'center', background: '#1e88e5', 
                    color: 'white', padding: '6px', borderRadius: '4px', 
                    textDecoration: 'none', fontSize: '0.85rem'
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