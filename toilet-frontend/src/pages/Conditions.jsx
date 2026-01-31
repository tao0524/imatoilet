import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../base.css';
import '../components.css';
import '../search.css'; // 既存のデザインを流用
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

function Conditions() {
  const navigate = useNavigate();

  // Search.jsx からフィルター項目を移植
  const [filters, setFilters] = useState({
    wheelchair: false,
    diaper: false,
    open24h: false,
    babyChair: false,
    public: false,
    type_park: false,
    type_station: false,
    type_mall: false
  });

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleSearch = () => {
    // チェックされた条件をURLパラメータに変換して、検索画面へ遷移
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, 'true');
      }
    });
    // 例: /search?wheelchair=true&open24h=true
    navigate(`/search?${params.toString()}`);
  };

  return (
    <main className="container" style={{ padding: '20px 16px' }}>
        
        {/* ヘッダー・戻る */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" className="back-link">
            <ArrowBackIcon fontSize="small" /> トップに戻る
          </Link>
          <h1 style={{ marginTop:'12px', fontSize:'1.6rem' }}>条件を指定して探す</h1>
          <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
            必要な設備や条件を選んでください。<br/>
            選んだ条件で絞り込んで検索します。
          </p>
        </div>

        {/* フィルターフォーム */}
        <section className="panel" style={{ padding: '24px 20px' }}>
          
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            優先条件
          </h3>
          <div className="filters" style={{ border: 'none', padding: 0, marginBottom: '24px' }}>
            <label className="chip">
              <input type="checkbox" name="wheelchair" checked={filters.wheelchair} onChange={handleFilterChange} />
              <span>♿ 車椅子対応</span>
            </label>
            <label className="chip">
              <input type="checkbox" name="diaper" checked={filters.diaper} onChange={handleFilterChange} />
              <span>👶 オムツ替え</span>
            </label>
            <label className="chip">
              <input type="checkbox" name="open24h" checked={filters.open24h} onChange={handleFilterChange} />
              <span>🕒 24時間</span>
            </label>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            詳細設備・利用条件
          </h3>
          <div className="filters" style={{ border: 'none', padding: 0, marginBottom: '24px' }}>
             <label className="chip">
                <input type="checkbox" name="babyChair" checked={filters.babyChair} onChange={handleFilterChange} />
                <span>ベビーチェアあり</span>
              </label>
              <label className="chip">
                <input type="checkbox" name="public" checked={filters.public} onChange={handleFilterChange} />
                <span>誰でも利用可</span>
              </label>
          </div>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
            場所タイプ
          </h3>
          <div className="filters" style={{ border: 'none', padding: 0 }}>
              <label className="chip chip--type">
                <input type="checkbox" name="type_park" checked={filters.type_park} onChange={handleFilterChange} />
                <span>公園</span>
              </label>
              <label className="chip chip--type">
                <input type="checkbox" name="type_station" checked={filters.type_station} onChange={handleFilterChange} />
                <span>駅・公共施設</span>
              </label>
              <label className="chip chip--type">
                <input type="checkbox" name="type_mall" checked={filters.type_mall} onChange={handleFilterChange} />
                <span>商業施設</span>
              </label>
          </div>

        </section>

        {/* 検索実行ボタン */}
        <div style={{ marginTop: '30px', textAlign: 'center', position: 'sticky', bottom: '20px', zIndex: 10 }}>
          <button className="btn btn-primary" onClick={handleSearch} style={{ maxWidth: '100%', boxShadow: '0 4px 20px rgba(30,136,229,0.3)' }}>
            <SearchIcon sx={{ mr: 1 }} />
            この条件で検索する
          </button>
        </div>

    </main>
  );
}

export default Conditions;