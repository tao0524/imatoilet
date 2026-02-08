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
            placeholder="住所、駅、施設名など" 
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
           {/* 地図検索（Nominatim） */}
           <button className="btn btn-sub" onClick={handlePlaceSearch} title="地図を移動して周辺を探す">
             <MapIcon fontSize="small" sx={{ mr: 0.5 }} /> 地図検索
           </button>
           
           {/* ★追加: キーワード検索（DB直接） */}
           <button className="btn btn-primary" onClick={handleKeywordSearch} title="登録データの住所や名前で探す" style={{ padding: '0 12px' }}>
             <SearchIcon fontSize="small" sx={{ mr: 0.5 }} /> キーワード
           </button>
           
           {/* 現在地リセット */}
           <button className="btn btn-sub" onClick={handleCurrentLocation} title="現在地に戻す">
             <MyLocationIcon fontSize="small" />
           </button>
        </div>
      </div>
      <p className="place-search__status">{searchStatus}</p>
    </section>
  );
}

export default PlaceSearch;