import { useState, useEffect, useMemo, useCallback } from 'react';
import { Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';

// アイコン
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';

const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

// ピンアイコン生成関数
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

function MapPanel({ filteredToilets, currentLocation, realLocation }) {
  const [selectedToiletId, setSelectedToiletId] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeInfo, setRouteInfo] = useState("");
  const [travelMode, setTravelMode] = useState("WALKING");
  const [originMode, setOriginMode] = useState(realLocation ? 'GPS' : 'CENTER');

  const [map, setMap] = useState(null);

  useEffect(() => {
    if(realLocation) setOriginMode('GPS');
  }, [realLocation]);

  // 場所が変わったら、選択状態やルートをリセット
  useEffect(() => {
    setSelectedToiletId(null);
    setDirectionsResponse(null);
    setRouteInfo("");
    setTravelMode("WALKING");
  }, [currentLocation]);

  const center = useMemo(() => {
    return currentLocation 
      ? { lat: currentLocation.lat, lng: currentLocation.lng }
      : DEFAULT_CENTER;
  }, [currentLocation]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // ★重要: 検索場所が変わったら強制的に移動
  useEffect(() => {
    if (map && currentLocation) {
      map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [currentLocation, map]);

  const selectedToilet = filteredToilets.find(t => t.id === selectedToiletId);

  // --- ルート検索ロジック ---
  useEffect(() => {
    const startPoint = (originMode === 'GPS' && realLocation) ? realLocation : currentLocation;

    if (selectedToilet && startPoint && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      
      const origin = { lat: startPoint.lat, lng: startPoint.lng };
      const destination = { lat: selectedToilet.lat, lng: selectedToilet.lng };

      const request = {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
      };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo(`${leg.duration.text} (${leg.distance.text})`);
        } else {
          if (travelMode === "WALKING") {
            directionsService.route({
              ...request,
              travelMode: window.google.maps.TravelMode.DRIVING
            }, (resCar, statusCar) => {
              if (statusCar === window.google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(resCar);
                const leg = resCar.routes[0].legs[0];
                setRouteInfo(`(車) ${leg.duration.text} (${leg.distance.text})`);
              } else {
                setDirectionsResponse(null);
                setRouteInfo("ルートが見つかりません");
              }
            });
          } else {
            setDirectionsResponse(null);
            setRouteInfo("ルートが見つかりません");
          }
        }
      });
    } else {
      setDirectionsResponse(null);
      setRouteInfo("");
    }
    
    // currentLocationを依存配列から除外済み（勝手なルート再計算を防ぐため）
  }, [selectedToiletId, realLocation, selectedToilet, travelMode, originMode]); 

  return (
    <section className="panel panel--map">
      <header className="panel-head">
        <h2 className="panel-title">地図</h2>
      </header>
      
      <div className="map-area" style={{ position: 'relative' }}>
        
        {/* コントロールエリア */}
        {selectedToilet && (
          <div style={{
            position: 'absolute', top: '10px', left: '10px', zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            <div style={{
              background: 'white', padding: '5px', borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)', display: 'flex', gap: '5px'
            }}>
              <button 
                onClick={() => setTravelMode("WALKING")}
                style={{
                  background: travelMode === "WALKING" ? '#e3f2fd' : 'transparent',
                  color: travelMode === "WALKING" ? '#1e88e5' : '#666',
                  border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'
                }}
              >
                <DirectionsWalkIcon fontSize="small" /> 徒歩
              </button>
              <button 
                onClick={() => setTravelMode("DRIVING")}
                style={{
                  background: travelMode === "DRIVING" ? '#e3f2fd' : 'transparent',
                  color: travelMode === "DRIVING" ? '#1e88e5' : '#666',
                  border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold'
                }}
              >
                <DirectionsCarIcon fontSize="small" /> 車
              </button>
            </div>

            <div style={{
              background: 'white', padding: '5px', borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)', display: 'flex', gap: '5px'
            }}>
              <button 
                onClick={() => setOriginMode("GPS")}
                disabled={!realLocation}
                title={!realLocation ? "現在地が取得できていません" : "現在のGPS位置から出発"}
                style={{
                  background: originMode === "GPS" ? '#e8f5e9' : 'transparent',
                  color: originMode === "GPS" ? '#2e7d32' : (realLocation ? '#666' : '#ccc'),
                  border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px',
                  cursor: realLocation ? 'pointer' : 'not-allowed', 
                  display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                <MyLocationIcon fontSize="small" /> 現在地から
              </button>
              <button 
                onClick={() => setOriginMode("CENTER")}
                title="検索した場所（地図の中心）から出発"
                style={{
                  background: originMode === "CENTER" ? '#fff3e0' : 'transparent',
                  color: originMode === "CENTER" ? '#ef6c00' : '#666',
                  border: '1px solid #ddd', borderRadius: '6px', padding: '6px 10px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.85rem'
                }}
              >
                <MapIcon fontSize="small" /> 地図中心から
              </button>
            </div>
          </div>
        )}

        <SafeGoogleMap
          center={center}
          zoom={14}
          style={CONTAINER_STYLE}
          onLoad={onMapLoad}
        >
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title={`地図の中心: ${currentLocation.address || ''}`}
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 6,
                fillColor: "#FF9800",
                fillOpacity: 0.8,
                strokeColor: "white",
                strokeWeight: 2,
              }}
              zIndex={900}
            />
          )}

          {realLocation && (
            <Marker
              position={{ lat: realLocation.lat, lng: realLocation.lng }}
              title="あなたの現在地"
              icon={{
                path: window.google?.maps?.SymbolPath?.CIRCLE,
                scale: 8,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 3,
              }}
              zIndex={1000}
            />
          )}

          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: travelMode === 'WALKING' ? "#4285F4" : "#FF5252",
                  strokeWeight: 5,
                  strokeOpacity: 0.7
                }
              }}
            />
          )}

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

          {selectedToilet && (
            <InfoWindow
              position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
              onCloseClick={() => setSelectedToiletId(null)}
              options={{ pixelOffset: { width: 0, height: -52 } }}
            >
              <div style={{ padding: '4px', maxWidth: '220px' }}>
                <b style={{ fontSize: '1rem', display:'block', marginBottom:'4px' }}>{selectedToilet.name}</b>
                
                {routeInfo && (
                  <div style={{ 
                    background: travelMode === 'WALKING' ? '#e3f2fd' : '#ffebee', 
                    color: travelMode === 'WALKING' ? '#0d47a1' : '#c62828', 
                    padding:'4px 8px', borderRadius:'4px', fontSize:'0.85rem', fontWeight:'bold', 
                    marginBottom:'8px', display:'flex', alignItems:'center', gap:'4px'
                  }}>
                    {travelMode === 'WALKING' ? <DirectionsWalkIcon fontSize="small"/> : <DirectionsCarIcon fontSize="small"/>}
                    {routeInfo}
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
                
                <a href={`http://googleusercontent.com/maps.google.com/?q=${selectedToilet.lat},${selectedToilet.lng}`} 
                   target="_blank" rel="noreferrer"
                   style={{ 
                     display: 'block', textAlign: 'center', marginTop: '8px',
                     fontSize: '0.75rem', color: '#666', textDecoration: 'underline'
                   }}
                >
                  Googleマップアプリで開く
                </a>
              </div>
            </InfoWindow>
          )}
        </SafeGoogleMap>
      </div>
    </section>
  );
}

export default MapPanel;