import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// アイコン
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';

// カテゴリアイコン
import TrainIcon from '@mui/icons-material/Train';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ParkIcon from '@mui/icons-material/Park';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import CategoryIcon from '@mui/icons-material/Category';

function FilterPanel({ 
  placeQuery, 
  setPlaceQuery, 
  handleKeywordSearch, 
  handleCurrentLocation,
  handlePlaceSearch,
  searchHistory,
  handleHistorySearch
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showHistory, setShowHistory] = useState(false);

  // URLパラメータ更新用ヘルパー
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === false || value === '') {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    setSearchParams(newParams);
  };

  const getBoolParam = (key) => searchParams.get(key) === 'true';
  const getStrParam = (key) => searchParams.get(key) || '';

  return (
    <aside className="filter-panel">
      {/* 1. キーワード・場所検索エリア */}
      <section className="filter-section">
        <h3 className="filter-title">場所・キーワード</h3>
        
        <div className="search-box-group" style={{ position: 'relative' }}>
          <input 
            type="search" 
            className="input-search-side"
            placeholder="場所や施設名を入力" 
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            // ★重要修正: Enterキーで確実に「地図移動」を実行させる
            onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()} 
            onFocus={() => setShowHistory(true)}
          />
          
          {/* 履歴ポップアップ */}
          {showHistory && searchHistory && searchHistory.length > 0 && (
             <div style={{
               position: 'absolute', top: '42px', left: 0, right: 0,
               background: '#fff', border: '1px solid #ddd',
               borderRadius: '8px', zIndex: 1000,
               boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
             }}>
               {searchHistory.map((hist, idx) => (
                 <div 
                   key={idx}
                   onClick={() => {
                     handleHistorySearch(hist);
                     setShowHistory(false);
                   }}
                   style={{
                     padding: '10px 12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                     display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#333'
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

          <div className="search-actions">
             {/* キーワード検索（リスト絞り込み） */}
             <button className="btn-icon-side" onClick={handleKeywordSearch} title="リスト内をキーワード検索">
               <SearchIcon fontSize="small"/>
             </button>
             {/* 地図検索（場所移動） */}
             <button className="btn-icon-side" onClick={handlePlaceSearch} title="地図移動">
               <MapIcon fontSize="small"/>
             </button>
             {/* 現在地 */}
             <button className="btn-icon-side" onClick={handleCurrentLocation} title="現在地">
               <MyLocationIcon fontSize="small"/>
             </button>
          </div>
        </div>
      </section>

      {/* 2. 施設タイプ */}
      <section className="filter-section">
        <h3 className="filter-title">施設の種類</h3>
        <div className="radio-group-vertical">
          <label className={`radio-row ${getStrParam('facilityCategory') === '' ? 'active' : ''}`}>
            <input 
              type="radio" name="cat" 
              checked={getStrParam('facilityCategory') === ''}
              onChange={() => updateParam('facilityCategory', '')}
            />
            <span className="radio-icon">🏠</span> 指定なし
          </label>
          
          {[
            { val: 'station', label: '駅・交通', icon: <TrainIcon fontSize="inherit"/> },
            { val: 'commercial', label: '商業施設', icon: <StorefrontIcon fontSize="inherit"/> },
            { val: 'park', label: '公園・屋外', icon: <ParkIcon fontSize="inherit"/> },
            { val: 'public', label: '公共施設', icon: <CategoryIcon fontSize="inherit"/> },
            { val: 'medical', label: '医療・福祉', icon: <LocalHospitalIcon fontSize="inherit"/> },
            { val: 'hotel_tourism', label: '観光・宿泊', icon: <HotelIcon fontSize="inherit"/> },
          ].map(opt => (
            <label key={opt.val} className={`radio-row ${getStrParam('facilityCategory') === opt.val ? 'active' : ''}`}>
              <input 
                type="radio" name="cat" 
                checked={getStrParam('facilityCategory') === opt.val}
                onChange={() => updateParam('facilityCategory', opt.val)}
              />
              <span className="radio-icon">{opt.icon}</span> {opt.label}
            </label>
          ))}
        </div>
      </section>

      {/* 3. 設備・条件 */}
      <section className="filter-section">
        <h3 className="filter-title">設備・特徴</h3>
        <div className="check-group-vertical">
          <CheckRow label="駐車場あり" pKey="parking" icon={<DirectionsCarIcon fontSize="inherit" color="success"/>} checked={getBoolParam('parking')} onChange={updateParam} />
          <CheckRow label="車椅子対応" pKey="wheelchair" checked={getBoolParam('wheelchair')} onChange={updateParam} />
          <CheckRow label="オムツ替え" pKey="diaper" checked={getBoolParam('diaper')} onChange={updateParam} />
          <CheckRow label="24時間利用" pKey="open24h" checked={getBoolParam('open24h')} onChange={updateParam} />
          <CheckRow label="オストメイト" pKey="ostomate" checked={getBoolParam('ostomate')} onChange={updateParam} />
          <CheckRow label="授乳室" pKey="nursing_room" checked={getBoolParam('nursing_room')} onChange={updateParam} />
          <CheckRow label="ウォシュレット" pKey="washlet" checked={getBoolParam('washlet')} onChange={updateParam} />
          <CheckRow label="男女別" pKey="gender_separated" checked={getBoolParam('gender_separated')} onChange={updateParam} />
          <CheckRow label="無料" pKey="free" checked={getBoolParam('free')} onChange={updateParam} />
        </div>
      </section>
    </aside>
  );
}

// 部品コンポーネント
function CheckRow({ label, pKey, icon, checked, onChange }) {
  return (
    <label className={`check-row ${checked ? 'checked' : ''}`}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(pKey, e.target.checked)}
      />
      <span className="check-box-ui">{checked && <CheckIcon fontSize="inherit"/>}</span>
      {icon && <span className="check-icon">{icon}</span>}
      <span className="check-text">{label}</span>
    </label>
  );
}

export default FilterPanel;