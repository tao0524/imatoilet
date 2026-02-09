import { useState, useEffect } from 'react';
import { Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';

// アイコン
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';

const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

// ピンアイコン生成関数（変更なし）
const getPinIcon = (toilet) => {
  let color = '#757575'; 
  let text = '🚽';
  switch (toilet.facilityCategory) {
    case 'station': color = '#ef5350'; text = '🚉'; break;
    case 'park': color = '#43a047'; text = '🌳'; break;
    case 'commercial': case 'convenience': color = '#fb8c00'; text = '🛍️'; break;
    case 'public': color = '#3949ab'; text = '🏢'; break;
    case 'medical': color = '#e91e63'; text = '🏥'; break;
    case 'hotel_tourism': color = '#8e24aa'; text = '🏨'; break;
    default: break;
  }
  const wheelchairBadge = toilet.wheelchair ? `
    <circle cx="32" cy="10" r="9" fill="#1976d2" stroke="white" stroke-width="1.5" />
    <text x="32" y="14" font-size="11" text-anchor="middle" fill="white" font-family="sans-serif">♿</text>
  ` : '';

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
  
  // ★ルート検索用のState
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeInfo, setRouteInfo] = useState("");

  const center = currentLocation 
    ? { lat: currentLocation.lat, lng: currentLocation.lng }
    : DEFAULT_CENTER;

  const selectedToilet = filteredToilets.find(t => t.id === selectedToiletId);

  // トイレを選択した際、自動でルートを検索する
  useEffect(() => {
    if (selectedToilet && currentLocation && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      
      directionsService.route({
        origin: { lat: currentLocation.lat, lng: currentLocation.lng },
        destination: { lat: selectedToilet.lat, lng: selectedToilet.lng },
        travelMode: window.google.maps.TravelMode.WALKING, // 徒歩ルート
      }, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          // 所要時間を取得
          const leg = result.routes[0].legs[0];
          setRouteInfo(`${leg.duration.text} (${leg.distance.text})`);
        } else {
          console.error(`Directions request failed: ${status}`);
          setRouteInfo("");
        }
      });
    } else {
      // 選択解除や現在地がない場合はルートを消す
      setDirectionsResponse(null);
      setRouteInfo("");
    }
  }, [selectedToiletId, currentLocation]); // selectedToiletId か currentLocation が変わったら再計算

  return (
    <section className="panel panel--map">
      <header className="panel-head">
        <h2 className="panel-title">地図</h2>
      </header>
      
      <div className="map-area">
        <SafeGoogleMap
          center={center}
          zoom={14}
          style={CONTAINER_STYLE}
        >
          {/* 現在地ピン */}
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title={`現在地: ${currentLocation.address || ''}`}
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

          {/* ★ルート描画 (青い線) */}
          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
                suppressMarkers: true, // デフォルトのA/Bピンは消して、自前のトイレピンを使う
                polylineOptions: {
                  strokeColor: "#4285F4", // Googleカラーの青
                  strokeWeight: 5,
                  strokeOpacity: 0.7
                }
              }}
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
                scaledSize: { width: 44, height: 52 }, 
                anchor: { x: 20, y: 52 }
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
              <div style={{ padding: '4px', maxWidth: '220px' }}>
                <b style={{ fontSize: '1rem', display:'block', marginBottom:'4px' }}>{selectedToilet.name}</b>
                
                {/* ★ルート情報の表示 */}
                {routeInfo && (
                  <div style={{ 
                    background:'#e3f2fd', color:'#0d47a1', padding:'4px 8px', 
                    borderRadius:'4px', fontSize:'0.85rem', fontWeight:'bold', 
                    marginBottom:'8px', display:'flex', alignItems:'center', gap:'4px'
                  }}>
                    <DirectionsWalkIcon fontSize="small"/> 徒歩 {routeInfo}
                  </div>
                )}
                
                <div style={{ margin: '6px 0', fontSize: '0.85rem', color: '#444' }}>
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
                    color: 'white', padding: '8px', borderRadius: '6px', 
                    textDecoration: 'none', fontSize: '0.9rem', fontWeight:'bold'
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