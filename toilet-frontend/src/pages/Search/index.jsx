import { useNavigate } from 'react-router-dom';
import { useToiletSearch } from '../../hooks/useToiletSearch';
import MapPanel from './MapPanel';
import ListPanel from './ListPanel';
import FilterPanel from './FilterPanel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../../search.css';

function Search() {
  const navigate = useNavigate();
  
  const {
    filteredToilets,
    currentLocation,
    realLocation,
    placeQuery,
    setPlaceQuery,
    searchStatus, 
    handlePlaceSearch,
    handleCurrentLocation,
    handleKeywordSearch,
    searchHistory,
    handleHistorySearch,
    removeFromHistory,
    selectedToiletId,      // ★追加
    setSelectedToiletId    // ★追加
  } = useToiletSearch();

  return (
    <main className="search-page-wrapper">

      <div className="search-back-bar">
        <button
          className="search-back-btn"
          onClick={() => navigate('/')}
        >
          <ArrowBackIcon fontSize="small" />
          <span>トップに戻る</span>
        </button>
      </div>

      {/* ★ ピン選択時は map-only-mode になる */}
      <div className={`three-col-layout ${selectedToiletId ? 'map-only-mode' : ''}`}>
        
        {/* ピンが選択されている時は隠す */}
        <div className={`col-filter ${selectedToiletId ? 'hidden' : ''}`}>
          <FilterPanel 
            placeQuery={placeQuery}
            setPlaceQuery={setPlaceQuery}
            handleKeywordSearch={handleKeywordSearch}
            handleCurrentLocation={handleCurrentLocation}
            handlePlaceSearch={handlePlaceSearch}
            searchHistory={searchHistory}
            handleHistorySearch={handleHistorySearch}
            removeFromHistory={removeFromHistory}
          />
        </div>

        <div className="col-map">
          {/* ピンが選択されている時はステータスバーを隠す */}
          {!selectedToiletId && searchStatus && <div className="map-status-bar">{searchStatus}</div>}
          <MapPanel 
            filteredToilets={filteredToilets}
            currentLocation={currentLocation}
            realLocation={realLocation}
            selectedToiletId={selectedToiletId}     // ★追加
            setSelectedToiletId={setSelectedToiletId} // ★追加
          />
        </div>

        {/* ピンが選択されている時はリストを隠す */}
        <div className={`col-list ${selectedToiletId ? 'hidden' : ''}`}>
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