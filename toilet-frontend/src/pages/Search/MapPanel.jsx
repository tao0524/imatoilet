import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// ★修正: Marker のインポートを削除（独自の AdvancedMarker に置き換えるため）
import { InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';

// アイコン
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';

const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

// --- 既存のSVGピンアイコン生成関数 ---
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

// =========================================================================
// ★新規追加: AdvancedMarkerElement を安全に呼び出すカスタムコンポーネント
// =========================================================================
const AdvancedMarker = ({ map, position, title, iconSrc, isCenter, isRealLocation, onClick }) => {
  const onClickRef = useRef(onClick);
  
  // onClick関数が再生成されてもピンが再描画されないようRefに保持
  useEffect(() => { onClickRef.current = onClick; }, [onClick]);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    let contentEl = document.createElement('div');
    
    // 見た目の出し分け（トイレピン、中心ピン、現在地ピン）
    if (iconSrc) {
      const img = document.createElement('img');
      img.src = iconSrc;
      img.style.width = '44px';
      img.style.height = '52px';
      img.style.cursor = 'pointer';
      contentEl.appendChild(img);
    } else if (isCenter) {
      Object.assign(contentEl.style, {
        width: '16px', height: '16px', backgroundColor: '#FF9800',
        border: '2px solid white', borderRadius: '50%', opacity: '0.8'
      });
    } else if (isRealLocation) {
      Object.assign(contentEl.style, {
        width: '24px', height: '24px', backgroundColor: '#4285F4',
        border: '3px solid white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      });
    }

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map, position, title, content: contentEl,
    });

    const listener = marker.addListener('gmp-click', () => {
      if (onClickRef.current) onClickRef.current();
    });

    return () => {
      window.google.maps.event.removeListener(listener);
      marker.map = null;
    };
  }, [map, position.lat, position.lng, title, iconSrc, isCenter, isRealLocation]);

  return null;
};
// =========================================================================


function MapPanel({ filteredToilets, currentLocation, realLocation }) {
  const [selectedToiletId, setSelectedToiletId] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeInfo, setRouteInfo] = useState("");
  const [travelMode, setTravelMode] = useState("WALKING");
  const [originMode, setOriginMode] = useState(realLocation ? 'GPS' : 'CENTER');

  const [map, setMap] = useState(null);

  useEffect(() => { if(realLocation) setOriginMode('GPS'); }, [realLocation]);

  useEffect(() => {
    setSelectedToiletId(null);
    setDirectionsResponse(null);
    setRouteInfo("");
    setTravelMode("WALKING");
  }, [currentLocation]);

  const center = useMemo(() => {
    return currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : DEFAULT_CENTER;
  }, [currentLocation]);

  const onMapLoad = useCallback((mapInstance) => { setMap(mapInstance); }, []);

  useEffect(() => {
    if (map && currentLocation) {
      map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [currentLocation, map]);

  const selectedToilet = filteredToilets.find(t => t.id === selectedToiletId);

  // ★フリーズ対策：トイレのピン生成数を制限
  const MARKER_LIMIT = 50;  

  const markerToilets = useMemo(() => {
    if (!Array.isArray(filteredToilets)) return [];
    return filteredToilets.slice(0, MARKER_LIMIT);
  }, [filteredToilets]);


  // --- ルート検索ロジック (既存通り維持) ---
  useEffect(() => {
    const startPoint = (originMode === 'GPS' && realLocation) ? realLocation : currentLocation;

    if (selectedToilet && startPoint && window.google) {
      const directionsService = new window.google.maps.DirectionsService();
      const origin = { lat: startPoint.lat, lng: startPoint.lng };
      const destination = { lat: selectedToilet.lat, lng: selectedToilet.lng };

      const request = { origin, destination, travelMode: window.google.maps.TravelMode[travelMode] };

      directionsService.route(request, (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
          const leg = result.routes[0].legs[0];
          setRouteInfo(`${leg.duration.text} (${leg.distance.text})`);
        } else {
          if (travelMode === "WALKING") {
            directionsService.route({ ...request, travelMode: window.google.maps.TravelMode.DRIVING }, (resCar, statusCar) => {
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
  }, [selectedToiletId, realLocation, selectedToilet, travelMode, originMode]); 

  return (
    <section className="panel panel--map">
      <header className="panel-head">
        <h2 className="panel-title">地図</h2>
      </header>
      
      <div className="map-area" style={{ position: 'relative' }}>
        
        {selectedToilet && (
          <div className="map-controls-overlay">
            <div className="map-controls-row">
              <button className={`map-ctrl-btn ${travelMode === "WALKING" ? 'active-walk' : ''}`} onClick={() => setTravelMode("WALKING")}>
                <DirectionsWalkIcon fontSize="small" /> 徒歩
              </button>
              <button className={`map-ctrl-btn ${travelMode === "DRIVING" ? 'active-drive' : ''}`} onClick={() => setTravelMode("DRIVING")}>
                <DirectionsCarIcon fontSize="small" /> 車
              </button>
            </div>
            <div className="map-controls-row">
              <button className={`map-ctrl-btn ${originMode === "GPS" ? 'active-gps' : ''}`} disabled={!realLocation} onClick={() => setOriginMode("GPS")}>
                <MyLocationIcon fontSize="small" /> 現在地から
              </button>
              <button className={`map-ctrl-btn ${originMode === "CENTER" ? 'active-center' : ''}`} onClick={() => setOriginMode("CENTER")}>
                <MapIcon fontSize="small" /> 地図中心から
              </button>
            </div>
          </div>
        )}

        <SafeGoogleMap center={center} zoom={14} style={CONTAINER_STYLE} onLoad={onMapLoad}>
          
          {/* ★修正: 検索中心のピン */}
          {currentLocation && (
            <AdvancedMarker
              map={map}
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title={`地図の中心: ${currentLocation.address || ''}`}
              isCenter={true}
            />
          )}

          {/* ★修正: 現在地のピン */}
          {realLocation && (
            <AdvancedMarker
              map={map}
              position={{ lat: realLocation.lat, lng: realLocation.lng }}
              title="あなたの現在地"
              isRealLocation={true}
            />
          )}

          {/* ルート表示 */}
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

          {/* ★修正: トイレのピン */}
          {markerToilets.map((t) => (
            <AdvancedMarker
              key={t.id}
              map={map}
              position={{ lat: t.lat, lng: t.lng }}
              title={t.name}
              iconSrc={getPinIcon(t)}
              onClick={() => setSelectedToiletId(t.id)}
            />
          ))}

          {/* InfoWindow は既存のまま */}
          {selectedToilet && (
            <InfoWindow
              position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
              onCloseClick={() => setSelectedToiletId(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -52) }}
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
                
                <a href={`https://maps.google.com/?q=${selectedToilet.lat},${selectedToilet.lng}`}
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