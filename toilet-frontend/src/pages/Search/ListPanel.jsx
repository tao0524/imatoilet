import { useNavigate } from 'react-router-dom';
import { normalizeEquipment } from '../../utils'; // ★追加

function ListPanel({ filteredToilets = [], currentLocation }) {
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
        {filteredToilets.map(t => {
          // ★修正: インラインの独自ロジックを廃止し utils.normalizeEquipment() に統一
          const eqSet = normalizeEquipment(t);

          return (
            <div key={t.id} className="toilet-card" onClick={() => navigate(`/detail/${t.id}`)}>
              {/* 上段：名前と距離 */}
              <div className="toilet-header">
                <div className="toilet-name">{t.name}</div>
                {t.distance && (
                  <div className="toilet-distance">📍 約 {Math.round(t.distance * 1000)} m</div>
                )}
              </div>

              {/* 下段：アイコン群 */}
              <div className="toilet-meta">
                {/* 1. 施設カテゴリ */}
                {t.facilityCategory === 'station'       && <span title="駅・交通">🚉</span>}
                {t.facilityCategory === 'commercial'    && <span title="商業施設">🛍️</span>}
                {t.facilityCategory === 'convenience'   && <span title="コンビニ">🏪</span>}
                {t.facilityCategory === 'park'          && <span title="公園">🌳</span>}
                {t.facilityCategory === 'public'        && <span title="公共施設">🏢</span>}
                {t.facilityCategory === 'medical'       && <span title="医療・福祉">🏥</span>}
                {t.facilityCategory === 'hotel_tourism' && <span title="観光・宿泊">🏨</span>}

                {/* 2. 設備アイコン (eqSet で配列・CSV・旧フラグを統合) */}
                {eqSet.has('WHEELCHAIR')       && <span title="車椅子">♿</span>}
                {eqSet.has('DIAPER')           && <span title="オムツ">👶</span>}
                {eqSet.has('OPEN_24H')         && <span title="24時間">🕒</span>}
                {eqSet.has('PARKING')          && <span title="駐車場">🚗</span>}
                {eqSet.has('OSTOMATE')         && <span title="オストメイト">➕</span>}
                {eqSet.has('NURSING_ROOM')     && <span title="授乳室">🍼</span>}
                {eqSet.has('WASHLET')          && <span title="ウォシュレット">🚽</span>}
                {eqSet.has('GENDER_SEPARATED') && <span title="男女別">🚻</span>}
                {eqSet.has('FREE')             && <span title="無料">💰</span>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ListPanel;