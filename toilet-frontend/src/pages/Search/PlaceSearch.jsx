import React, { useState } from 'react';

// アイコン
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import MyLocationIcon from '@mui/icons-material/MyLocation';

function PlaceSearch({ 
  placeQuery, 
  setPlaceQuery, 
  handlePlaceSearch, 
  handleCurrentLocation,
  handleKeywordSearch, // ★追加
  searchStatus,
  searchHistory,       // ★追加
  handleHistorySearch  // ★追加
}) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <section className="place-search">
      <div className="place-search__row">
        <div style={{ position: 'relative' }}>
          <input 
            type="search" 
            className="input-search"
            placeholder="駅名・場所・施設名を入力"
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            // onBlur={() => setTimeout(() => setShowHistory(false), 200)} // クリック判定用ディレイ
            onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()} // Enter時はキーワード検索優先
          />
          
          {/* ★追加: 履歴のポップアップ表示 */}
          {showHistory && searchHistory && searchHistory.length > 0 && (
             <div style={{
               position: 'absolute', top: '100%', left: 0, right: 0,
               background: '#fff', border: '1px solid #ddd',
               borderRadius: '0 0 12px 12px', zIndex: 1000,
               boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
             }}>
               {searchHistory.map((hist, idx) => (
                 <div 
                   key={idx}
                   onClick={() => {
                     handleHistorySearch(hist);
                     setShowHistory(false);
                   }}
                   style={{
                     padding: '10px 14px', borderBottom: '1px solid #eee', cursor: 'pointer',
                     display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                   }}
                 >
                   <HistoryIcon fontSize="small" color="action" />
                   {hist}
                 </div>
               ))}
               <div 
                 onClick={() => setShowHistory(false)} 
                 style={{ padding: '8px', textAlign: 'center', fontSize: '0.8rem', color: '#888', cursor: 'pointer' }}
               >
                 閉じる
               </div>
             </div>
          )}
        </div>

        <div className="place-search__btns">
           <button className="btn btn-primary" onClick={handlePlaceSearch} title="検索">
             <SearchIcon fontSize="small" />
           </button>
           <button className="btn btn-sub btn-location-mobile" onClick={handleCurrentLocation} title="現在地に戻す">
             <MyLocationIcon fontSize="small" />
           </button>
        </div>
      </div>
      <p style={{ fontSize: '0.75rem', color: '#888', margin: '4px 0 0', lineHeight: '1.5' }}>
        🗺️ 地図で探す：駅名・エリア名向け　／　🔍 DB検索：施設名が分かる時向け
      </p>
      <p className="place-search__status">{searchStatus}</p>
    </section>
  );
}

export default PlaceSearch;