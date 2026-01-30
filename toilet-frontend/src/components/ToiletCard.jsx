import { Link } from 'react-router-dom';

function ToiletCard({ toilet }) {
  return (
    <div className="toilet-card">
      <h4>{toilet.name}</h4>
      <p className="address">📍 {toilet.address || '住所未登録'}</p>
      <div className="tags">
        {toilet.publicUse && <span className="tag">公共</span>}
        {toilet.wheelchair && <span className="tag">多目的</span>}
        {toilet.diaper && <span className="tag">オムツ交換</span>}
      </div>
      <Link to={`/detail/${toilet.id}`} className="detail-link">
        詳細を見る
      </Link>
    </div>
  );
}

export default ToiletCard;