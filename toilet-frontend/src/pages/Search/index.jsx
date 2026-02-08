import { useNavigate } from 'react-router-dom';
import { useToiletSearch } from '../../hooks/useToiletSearch';
import PlaceSearch from './PlaceSearch';
import MapPanel from './MapPanel';
import ListPanel from './ListPanel';
import '../../search.css';

import SettingsIcon from '@mui/icons-material/Settings';

function Search() {
  const navigate = useNavigate();
  
  const {
    filteredToilets,
    currentLocation,
    placeQuery,
    setPlaceQuery,
    searchStatus,
    handlePlaceSearch,
    handleCurrentLocation,
    handleKeywordSearch, // ★受け取り
    searchHistory,       // ★受け取り
    handleHistorySearch  // ★受け取り
  } = useToiletSearch();

  const goConditions = () => {
    navigate('/conditions');
  };

  return (
    <main className="search-main">
      <div className="container">
        
        <PlaceSearch
          placeQuery={placeQuery}
          setPlaceQuery={setPlaceQuery}
          handlePlaceSearch={handlePlaceSearch}
          handleCurrentLocation={handleCurrentLocation}
          handleKeywordSearch={handleKeywordSearch} // ★渡す
          searchStatus={searchStatus}
          searchHistory={searchHistory}       // ★渡す
          handleHistorySearch={handleHistorySearch} // ★渡す
        />

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
          <MapPanel 
            filteredToilets={filteredToilets}
            currentLocation={currentLocation}
          />

          <ListPanel 
            filteredToilets={filteredToilets}
            currentLocation={currentLocation}
          />
        </div>
      </div>
    </main>
  );
}

export default Search;