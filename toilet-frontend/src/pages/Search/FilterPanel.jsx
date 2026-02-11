import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

// --- 必須アイコンのインポート（すべて網羅） ---
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckIcon from '@mui/icons-material/Check';
import HistoryIcon from '@mui/icons-material/History';
import TrainIcon from '@mui/icons-material/Train';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ParkIcon from '@mui/icons-material/Park';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import CategoryIcon from '@mui/icons-material/Category';

function FilterPanel({ 
  placeQuery, setPlaceQuery, handleKeywordSearch, handleCurrentLocation,
  handlePlaceSearch, searchHistory, handleHistorySearch
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showHistory, setShowHistory] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // アコーディオン用

  // ポップアップの外側を判定するための ref
  const historyRef = useRef(null);

  // 外側クリックとEscキーでポップアップを閉じる安全なロジック
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowHistory(false);
      }
    };

    if (showHistory) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showHistory]);

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
      <section className="filter-section filter-section-top">
        <h3 className="filter-title desktop-only">場所・キーワード</h3>
        
        <div className="search-box-group" style={{ position: 'relative' }} ref={historyRef}>
          <input 
            type="search" 
            className="input-search-side"
            placeholder="場所や施設名を入力" 
            value={placeQuery}
            onChange={(e) => setPlaceQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlaceSearch()} 
            onFocus={() => setShowHistory(true)}
          />
          
          {/* 履歴ポップアップ */}
          {showHistory && searchHistory && searchHistory.length > 0 && (
            <>
              <div className="history-backdrop" onClick={() => setShowHistory(false)}></div>
              <div className="history-popup">
                <div className="history-popup-header">
                  <span>過去の検索履歴</span>
                  <button className="history-close-btn" onClick={() => setShowHistory(false)}>✕</button>
                </div>
                <div className="history-list">
                  {searchHistory.map((hist, idx) => (
                    <div 
                      key={idx}
                      className="history-item"
                      onClick={() => {
                        handleHistorySearch(hist);
                        setShowHistory(false);
                      }}
                    >
                      <HistoryIcon fontSize="small" color="action" />
                      {hist}
                    </div>
                  ))}
                </div>
                <div className="history-footer desktop-only" onClick={() => setShowHistory(false)}>
                  閉じる
                </div>
              </div>
            </>
          )}

          <div className="search-actions">
             <button className="btn-icon-side desktop-only-btn" onClick={handleKeywordSearch} title="リスト内をキーワード検索">
               <SearchIcon fontSize="small"/>
             </button>
             <button className="btn-icon-side desktop-only-btn" onClick={handlePlaceSearch} title="地図移動">
               <MapIcon fontSize="small"/>
             </button>
             <button className="btn-icon-side btn-location" onClick={handleCurrentLocation} title="現在地">
               <MyLocationIcon fontSize="small" className="loc-icon"/>
               <span className="loc-text">現在地</span>
             </button>
          </div>
        </div>
      </section>

      {/* スマホ用のアコーディオン開閉ボタン */}
      <button 
        className="mobile-toggle-btn" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '▲ 詳細条件を閉じる' : '▼ 詳細条件を開く'}
      </button>

      {/* 開閉するエリア */}
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        
        {/* 2. 施設タイプ */}
        <section className="filter-section">
          <h3 className="filter-title">詳細条件（施設）</h3>
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
        <section className="filter-section" style={{ borderBottom: 'none', marginBottom: 0 }}>
          <div className="check-group-vertical">
            <CheckRow label="オムツ交換台" pKey="diaper" icon="👶" checked={getBoolParam('diaper')} onChange={updateParam} />
            <CheckRow label="車椅子対応" pKey="wheelchair" icon="♿" checked={getBoolParam('wheelchair')} onChange={updateParam} />
            <CheckRow label="24時間営業" pKey="open24h" icon="🕒" checked={getBoolParam('open24h')} onChange={updateParam} />
            
            <CheckRow label="駐車場あり" pKey="parking" icon="🚗" checked={getBoolParam('parking')} onChange={updateParam} />
            <CheckRow label="オストメイト" pKey="ostomate" icon="➕" checked={getBoolParam('ostomate')} onChange={updateParam} />
            <CheckRow label="授乳室" pKey="nursing_room" icon="🍼" checked={getBoolParam('nursing_room')} onChange={updateParam} />
            <CheckRow label="ウォシュレット" pKey="washlet" icon="🚽" checked={getBoolParam('washlet')} onChange={updateParam} />
            <CheckRow label="男女別" pKey="gender_separated" icon="🚻" checked={getBoolParam('gender_separated')} onChange={updateParam} />
            <CheckRow label="無料" pKey="free" icon="💰" checked={getBoolParam('free')} onChange={updateParam} />
          </div>
        </section>
        
        <button 
          className="mobile-toggle-btn btn-bottom" 
          onClick={() => setIsOpen(false)}
        >
          ▲ 詳細条件を閉じる
        </button>
      </div>
    </aside>
  );
}

// トグルスイッチ用の部品コンポーネント
function CheckRow({ label, pKey, icon, checked, onChange }) {
  return (
    <label className={`check-row ${checked ? 'checked' : ''}`}>
      <div className="check-label-content">
        {icon && <span className="check-icon">{icon}</span>}
        <span className="check-text">{label}</span>
      </div>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={(e) => onChange(pKey, e.target.checked)}
      />
      <span className="toggle-switch"></span>
    </label>
  );
}

export default FilterPanel;