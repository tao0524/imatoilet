import { useNavigate } from 'react-router-dom';
import { useToiletSearch } from '../../hooks/useToiletSearch';
import MapPanel from './MapPanel';
import ListPanel from './ListPanel';
import FilterPanel from './FilterPanel'; // ★作成したファイルをインポート
import '../../search.css';

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
    handleKeywordSearch,
    searchHistory,
    handleHistorySearch
  } = useToiletSearch();

  return (
    <main className="search-page-wrapper">
      {/* 3カラムレイアウトコンテナ */}
      <div className="three-col-layout">
        
        {/* 左カラム: 検索条件 */}
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

        {/* 中央カラム: 地図 (メイン) */}
        <div className="col-map">
          {/* 検索ステータスを地図の上に少し表示 */}
          {searchStatus && <div className="map-status-bar">{searchStatus}</div>}
          <MapPanel 
            filteredToilets={filteredToilets}
            currentLocation={currentLocation}
          />
        </div>

        {/* 右カラム: 検索結果リスト */}
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