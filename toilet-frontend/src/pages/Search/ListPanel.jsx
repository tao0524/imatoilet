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
            <div className="toilet-name">{t.name}</div>
            <div className="toilet-meta">
              {/* アイコン表示 */}
              {t.facilityCategory === 'station' && <span title="駅・交通">🚉</span>}
              {t.facilityCategory === 'commercial' && <span title="商業施設">🛍️</span>}
              {t.facilityCategory === 'park' && <span title="公園">🌳</span>}
              
              {t.wheelchair && <span>♿</span>}
              {t.diaper && <span>👶</span>}
              {t.open24h && <span>🕒</span>}
              
              {t.distance && <span>📍 約 {Math.round(t.distance * 1000)} m</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ListPanel;