import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { SafeGoogleMap } from '../../components/SafeGoogleMap';
import { Link } from 'react-router-dom';
import { normalizeEquipment } from '../../utils'; 

// アイコン
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

const DEFAULT_CENTER = { lat: 36.0825, lng: 140.1120 };
const CONTAINER_STYLE = { width: '100%', height: '100%' };

const getPinIcon = (toilet) => {
  let color = '#757575';
  let text = '🚽';
  switch (toilet.facilityCategory) {
    case 'station':                        color = '#ef5350'; text = '🚉'; break;
    case 'park':                           color = '#43a047'; text = '🌳'; break;
    case 'commercial': case 'convenience': color = '#fb8c00'; text = '🛍️'; break;
    case 'public':                         color = '#3949ab'; text = '🏢'; break;
    case 'medical':                        color = '#e91e63'; text = '🏥'; break;
    case 'hotel_tourism':                  color = '#8e24aa'; text = '🏨'; break;
    default: break;
  }

  const eqSet = normalizeEquipment(toilet);

  const wheelchairBadge = eqSet.has('WHEELCHAIR') ? `
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

const AdvancedMarker = ({ map, position, title, iconSrc, isCenter, isRealLocation, onClick }) => {
  const onClickRef = useRef(onClick);

  useEffect(() => { onClickRef.current = onClick; }, [onClick]);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const contentEl = document.createElement('div');

    if (iconSrc) {
      const img = document.createElement('img');
      img.src = iconSrc;
      img.style.width = '44px';
      img.style.height = '52px';
      img.style.cursor = 'pointer';
      
      // ★修正: Google Mapsの内部処理と衝突する pointerEvents, click, touchend の直接付与を全削除し、
      // API公式の gmp-click イベントに完全に任せます。
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
      map, 
      position, 
      title, 
      content: contentEl,
      gmpClickable: true // ★ これにより公式機能としてクリック可能になります
    });

    // API公式のクリックイベントを監視
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

function MapPanel({ filteredToilets = [], currentLocation, realLocation, selectedToiletId, setSelectedToiletId }) {
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeInfo, setRouteInfo] = useState('');
  const [travelMode, setTravelMode] = useState('WALKING');
  const [map, setMap] = useState(null);

  useEffect(() => {
    setSelectedToiletId(null);
    setDirectionsResponse(null);
    setRouteInfo('');
    setTravelMode('WALKING');
  }, [currentLocation, setSelectedToiletId]);

  const center = useMemo(() => {
    return currentLocation ? { lat: currentLocation.lat, lng: currentLocation.lng } : DEFAULT_CENTER;
  }, [currentLocation]);

  const onMapLoad = useCallback((mapInstance) => { setMap(mapInstance); }, []);

  useEffect(() => {
    if (map && currentLocation && !selectedToiletId) {
      map.panTo({ lat: currentLocation.lat, lng: currentLocation.lng });
    }
  }, [currentLocation, map, selectedToiletId]);

  const selectedToilet = filteredToilets.find(t => t.id === selectedToiletId);

  const MARKER_LIMIT = 50;
  const markerToilets = useMemo(() => {
    if (!Array.isArray(filteredToilets)) return [];
    return filteredToilets.slice(0, MARKER_LIMIT);
  }, [filteredToilets]);

  const selectedEqSet = useMemo(() => {
    if (!selectedToilet) return new Set();
    return normalizeEquipment(selectedToilet);
  }, [selectedToilet]);

  useEffect(() => {
    const startPoint = realLocation || currentLocation;

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
          if (travelMode === 'WALKING') {
            directionsService.route(
              { ...request, travelMode: window.google.maps.TravelMode.DRIVING },
              (resCar, statusCar) => {
                if (statusCar === window.google.maps.DirectionsStatus.OK) {
                  setDirectionsResponse(resCar);
                  const leg = resCar.routes[0].legs[0];
                  setRouteInfo(`(車) ${leg.duration.text} (${leg.distance.text})`);
                } else {
                  setDirectionsResponse(null);
                  setRouteInfo('ルートが見つかりません');
                }
              }
            );
          } else {
            setDirectionsResponse(null);
            setRouteInfo('ルートが見つかりません');
          }
        }
      });
    } else {
      setDirectionsResponse(null);
      setRouteInfo('');
    }
  }, [selectedToiletId, realLocation, currentLocation, selectedToilet, travelMode]);

  return (
    <section className="panel panel--map">
      <div className="map-area" style={{ position: 'relative' }}>
        <SafeGoogleMap center={center} zoom={14} style={CONTAINER_STYLE} onLoad={onMapLoad}>

          {currentLocation && (
            <AdvancedMarker
              map={map}
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              title={`地図の中心: ${currentLocation.address || ''}`}
              isCenter={true}
            />
          )}

          {realLocation && (
            <AdvancedMarker
              map={map}
              position={{ lat: realLocation.lat, lng: realLocation.lng }}
              title="あなたの現在地"
              isRealLocation={true}
            />
          )}

          {directionsResponse && (
            <DirectionsRenderer
              options={{
                directions: directionsResponse,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: travelMode === 'WALKING' ? '#4285F4' : '#FF5252',
                  strokeWeight: 5,
                  strokeOpacity: 0.7
                }
              }}
            />
          )}

          {markerToilets
            .filter(t => selectedToiletId ? t.id === selectedToiletId : true)
            .map((t) => (
              <AdvancedMarker
                key={t.id}
                map={map}
                position={{ lat: t.lat, lng: t.lng }}
                title={t.name}
                iconSrc={getPinIcon(t)}
                onClick={() => setSelectedToiletId(t.id)}
              />
          ))}

          {selectedToilet && (
            <InfoWindow
              position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
              onCloseClick={() => setSelectedToiletId(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -52) }}
            >
              <div style={{ padding: '4px', maxWidth: '240px' }}>
                <b style={{ fontSize: '1rem', display: 'block', marginBottom: '10px', textAlign: 'center' }}>
                  {selectedToilet.name}
                </b>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <button
                    onClick={() => setTravelMode('WALKING')}
                    style={{
                      flex: 1, padding: '6px 0', border: '1px solid #1976d2', 
                      background: travelMode === 'WALKING' ? '#1976d2' : '#fff',
                      color: travelMode === 'WALKING' ? '#fff' : '#1976d2',
                      borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      fontWeight: 'bold', fontSize: '0.9rem'
                    }}
                  >
                    <DirectionsWalkIcon fontSize="small" /> 徒歩
                  </button>
                  <button
                    onClick={() => setTravelMode('DRIVING')}
                    style={{
                      flex: 1, padding: '6px 0', border: '1px solid #c62828', 
                      background: travelMode === 'DRIVING' ? '#c62828' : '#fff',
                      color: travelMode === 'DRIVING' ? '#fff' : '#c62828',
                      borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      fontWeight: 'bold', fontSize: '0.9rem'
                    }}
                  >
                    <DirectionsCarIcon fontSize="small" /> 車
                  </button>
                </div>

                {routeInfo && (
                  <div style={{
                    background: '#f5f5f5', color: '#333',
                    padding: '6px 8px', borderRadius: '4px', fontSize: '0.85rem',
                    fontWeight: 'bold', marginBottom: '10px', textAlign: 'center'
                  }}>
                    ルート所要時間: {routeInfo}
                  </div>
                )}

                <div style={{ margin: '6px 0', fontSize: '0.85rem', color: '#444' }}>
                  清潔度: {'⭐'.repeat(selectedToilet.cleanliness || 3)}
                </div>

                <div style={{ marginBottom: '12px' }}>
                  {selectedEqSet.has('WHEELCHAIR')       && <span title="車椅子"        style={{ marginRight: 4 }}>♿</span>}
                  {selectedEqSet.has('DIAPER')           && <span title="オムツ"        style={{ marginRight: 4 }}>👶</span>}
                  {selectedEqSet.has('OPEN_24H')         && <span title="24時間"        style={{ marginRight: 4 }}>🕒</span>}
                  {selectedEqSet.has('PARKING')          && <span title="駐車場"        style={{ marginRight: 4 }}>🚗</span>}
                  {selectedEqSet.has('OSTOMATE')         && <span title="オストメイト"  style={{ marginRight: 4 }}>➕</span>}
                  {selectedEqSet.has('WASHLET')          && <span title="ウォシュレット" style={{ marginRight: 4 }}>🚽</span>}
                  {selectedEqSet.has('NURSING_ROOM')     && <span title="授乳室"        style={{ marginRight: 4 }}>🍼</span>}
                  {selectedEqSet.has('GENDER_SEPARATED') && <span title="男女別"        style={{ marginRight: 4 }}>🚻</span>}
                  {selectedEqSet.has('FREE')             && <span title="無料">💰</span>}
                </div>

                <Link
                  to={`/detail/${selectedToilet.id}`}
                  style={{
                    display: 'block', textAlign: 'center', background: '#1e88e5',
                    color: 'white', padding: '10px', borderRadius: '6px',
                    textDecoration: 'none', fontSize: '0.95rem', fontWeight: 'bold'
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