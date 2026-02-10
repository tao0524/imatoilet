import { useNavigate } from 'react-router-dom';
import { useToiletSearch } from '../../hooks/useToiletSearch';
import MapPanel from './MapPanel';
import ListPanel from './ListPanel';
import FilterPanel from './FilterPanel';
import '../../search.css';

function Search() {
  const navigate = useNavigate();
  
  const {
    filteredToilets,
    currentLocation,
    realLocation, // ★追加: フックから受け取る
    placeQuery,
    setPlaceQuery,
    searchStatus, 
    handlePlaceSearch,
    handleCurrentLocation,
    handleKeywordSearch,
    searchHistory,
    handleHistorySearch
  } = useToiletSearch();

  return (
    <main className="search-page-wrapper">
      <div className="three-col-layout">
        <div className="col-filter">
          <FilterPanel 
            placeQuery={placeQuery}
            setPlaceQuery={setPlaceQuery}
            handleKeywordSearch={handleKeywordSearch}
            handleCurrentLocation={handleCurrentLocation}
            handlePlaceSearch={handlePlaceSearch}
            searchHistory={searchHistory}
            handleHistorySearch={handleHistorySearch}
          />
        </div>

        <div className="col-map">
          {searchStatus && <div className="map-status-bar">{searchStatus}</div>}
          <MapPanel 
            filteredToilets={filteredToilets}
            currentLocation={currentLocation}
            realLocation={realLocation} // ★重要: MapPanelにこれを渡さないとGPS機能が動きません
          />
        </div>

        <div className="col-list">
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