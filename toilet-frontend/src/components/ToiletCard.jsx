// toilet-frontend/src/components/ToiletCard.jsx
import { Link } from 'react-router-dom';

function ToiletCard({ toilet }) {
  // equipmentが配列ならそのまま、文字列(旧データ)ならsplit、なければ空配列
  let eqList = [];
  if (Array.isArray(toilet.equipment)) {
    eqList = toilet.equipment;
  } else if (typeof toilet.equipment === 'string') {
    eqList = toilet.equipment.split(',');
  }

  // 大文字小文字を無視してチェックするためのヘルパー
  const has = (key) => eqList.some(e => e.toUpperCase() === key.toUpperCase());

  // フラグまたはequipmentリストから判定
  const isPublic = toilet.publicUse;
  const isWheelchair = toilet.wheelchair || has('WHEELCHAIR');
  const isDiaper = toilet.diaper || has('DIAPER');

  return (
    <div className="toilet-card">
      <h4>{toilet.name}</h4>
      <p className="address">📍 {toilet.address || '住所未登録'}</p>
      <div className="tags">
        {isPublic && <span className="tag">公共</span>}
        {isWheelchair && <span className="tag">多目的</span>}
        {isDiaper && <span className="tag">オムツ交換</span>}
      </div>
      <Link to={`/detail/${toilet.id}`} className="detail-link">
        詳細を見る
      </Link>
    </div>
  );
}

export default ToiletCard;