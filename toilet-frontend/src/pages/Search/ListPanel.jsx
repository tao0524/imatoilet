import { useNavigate } from 'react-router-dom';

function ListPanel({ filteredToilets, currentLocation }) {
  const navigate = useNavigate();

  return (
    <section className="panel panel--list">
      <header className="panel-head">
        <h2 className="panel-title">検索結果</h2>
        <div className="panel-meta">
          並び順：{currentLocation ? "近い順" : "おすすめ順"} / {filteredToilets.length}件
        </div>
      </header>
      <div className="list-area">
        {filteredToilets.map(t => (
          <div key={t.id} className="toilet-card" onClick={() => navigate(`/detail/${t.id}`)}>
            {/* 上段：名前と距離を横並びにする */}
            <div className="toilet-header">
              <div className="toilet-name">{t.name}</div>
              {t.distance && <div className="toilet-distance">📍 約 {Math.round(t.distance * 1000)} m</div>}
            </div>
            
            {/* 下段：アイコン群（ここだけが横にスワイプできるようになる） */}
            <div className="toilet-meta">
              {/* 1. 施設カテゴリ */}
              {t.facilityCategory === 'station' && <span title="駅・交通">🚉</span>}
              {t.facilityCategory === 'commercial' && <span title="商業施設">🛍️</span>}
              {t.facilityCategory === 'convenience' && <span title="コンビニ">🏪</span>}
              {t.facilityCategory === 'park' && <span title="公園">🌳</span>}
              {t.facilityCategory === 'public' && <span title="公共施設">🏢</span>}
              {t.facilityCategory === 'medical' && <span title="医療・福祉">🏥</span>}
              {t.facilityCategory === 'hotel_tourism' && <span title="観光・宿泊">🏨</span>}
              
              {/* 2. 基本フラグ */}
              {t.wheelchair && <span title="車椅子">♿</span>}
              {t.diaper && <span title="オムツ">👶</span>}
              {t.open24h && <span title="24時間">🕒</span>}

              {/* 3. 追加設備 (カンマ区切りのequipment文字列をチェック) */}
              {t.equipment && t.equipment.toLowerCase().includes('parking') && <span title="駐車場">🚗</span>}
              {t.equipment && t.equipment.toLowerCase().includes('ostomate') && <span title="オストメイト">➕</span>}
              {t.equipment && t.equipment.toLowerCase().includes('nursing_room') && <span title="授乳室">🍼</span>}
              {t.equipment && t.equipment.toLowerCase().includes('washlet') && <span title="ウォシュレット">🚽</span>}
              {t.equipment && t.equipment.toLowerCase().includes('gender_separated') && <span title="男女別">🚻</span>}
              {t.equipment && t.equipment.toLowerCase().includes('free') && <span title="無料">💰</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ListPanel;