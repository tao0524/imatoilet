import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../base.css';
import '../components.css';
import '../search.css';

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';

// カテゴリアイコン
import TrainIcon from '@mui/icons-material/Train';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ParkIcon from '@mui/icons-material/Park';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import HotelIcon from '@mui/icons-material/Hotel';
import CategoryIcon from '@mui/icons-material/Category';

function Conditions() {
  const navigate = useNavigate();

  // --- 状態管理 ---
  // 旧仕様フィルター (wheelchair/diaper/open24hはAPIの互換フラグとして残す)
  // ★修正: babyChair を削除（newConditions の baby_chair に統合）
  const [filters, setFilters] = useState({
    wheelchair: false,
    diaper:     false,
    open24h:    false,
    public:     false,
  });

  // 新仕様のカテゴリー
  const [facilityCategory, setFacilityCategory] = useState('');

  // 新仕様の設備条件 (EquipmentType enum に対応するキーで管理)
  // ★修正: baby_chair を追加 (EquipmentType.BABY_CHAIR に対応)
  const [newConditions, setNewConditions] = useState({
    parking:          false,
    ostomate:         false,
    nursing_room:     false,
    baby_chair:       false, // ★追加
    washlet:          false,
    visual_support:   false,
    gender_separated: false,
    unisex:           false,
    free:             false,
    paid:             false,
  });

  // --- ハンドラ ---
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({ ...prev, [name]: checked }));
  };

  const handleNewConditionChange = (e) => {
    const { name, checked } = e.target;
    setNewConditions(prev => ({ ...prev, [name]: checked }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    // 1. 施設カテゴリー
    if (facilityCategory) {
      params.append('facilityCategory', facilityCategory);
    }

    // 2. 旧フィルタ群 (wheelchair, diaper, open24h, public)
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, 'true');
    });

    // 3. 新設備条件 (parking, ostomate, nursing_room, baby_chair, washlet, etc.)
    Object.keys(newConditions).forEach(key => {
      if (newConditions[key]) {
        // useToiletSearch の EQ_KEY_MAP のキー名と一致させる
        params.append(key, 'true');
      }
    });

    // 結果として /search?wheelchair=true&nursing_room=true... のようなURLになる
    navigate(`/search?${params.toString()}`);
  };

// ... (以下略)

  // 施設カテゴリオプション定義
  const categoryOptions = [
    { val: 'station',       label: '駅・交通',  icon: <TrainIcon fontSize="small" /> },
    { val: 'commercial',    label: '商業施設',  icon: <StorefrontIcon fontSize="small" /> },
    { val: 'park',          label: '公園・屋外', icon: <ParkIcon fontSize="small" /> },
    { val: 'public',        label: '公共施設',  icon: <CategoryIcon fontSize="small" /> },
    { val: 'medical',       label: '医療・福祉', icon: <LocalHospitalIcon fontSize="small" /> },
    { val: 'hotel_tourism', label: '観光・宿泊', icon: <HotelIcon fontSize="small" /> },
  ];

  return (
    <main className="container" style={{ padding: '20px 16px', maxWidth: '800px' }}>

      {/* ヘッダー */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/" className="back-link">
          <ArrowBackIcon fontSize="small" /> トップに戻る
        </Link>
        <h1 style={{ marginTop: '12px', fontSize: '1.6rem' }}>条件を指定して探す</h1>
        <p style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.5 }}>
          探しているトイレの条件を選択してください。
        </p>
      </div>

      {/* フォーム全体 */}
      <div style={{ display: 'grid', gap: '24px' }}>

        <section className="panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckIcon color="primary" /> 設備・特徴
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>（複数選択可）</span>
          </h3>

          <div className="filters" style={{ border: 'none', padding: 0, gap: '10px' }}>

            {/* よく使う条件（highlight） */}
            <FilterChip label="🚗 駐車場あり"   name="parking"    checked={newConditions.parking}    onChange={handleNewConditionChange} highlight />
            <FilterChip label="♿ 車椅子対応"   name="wheelchair" checked={filters.wheelchair}       onChange={handleFilterChange}       highlight />
            <FilterChip label="👶 オムツ替え"   name="diaper"     checked={filters.diaper}           onChange={handleFilterChange}       highlight />
            <FilterChip label="➕ オストメイト" name="ostomate"   checked={newConditions.ostomate}   onChange={handleNewConditionChange} highlight />

            {/* その他の条件 */}
            <FilterChip label="🕒 24時間利用"    name="open24h"          checked={filters.open24h}                  onChange={handleFilterChange} />
            <FilterChip label="🍼 授乳室"        name="nursing_room"     checked={newConditions.nursing_room}       onChange={handleNewConditionChange} />
            {/* ★修正: babyChair (URLパラメータに送られるだけで未機能) を
                        baby_chair (EquipmentType.BABY_CHAIR に対応) に変更 */}
            <FilterChip label="🪑 ベビーチェア"  name="baby_chair"       checked={newConditions.baby_chair}         onChange={handleNewConditionChange} />
            <FilterChip label="🚽 ウォシュレット" name="washlet"         checked={newConditions.washlet}            onChange={handleNewConditionChange} />
            <FilterChip label="🚻 男女別"        name="gender_separated" checked={newConditions.gender_separated}   onChange={handleNewConditionChange} />
            <FilterChip label="💰 無料"          name="free"             checked={newConditions.free}               onChange={handleNewConditionChange} />
            <FilterChip label="誰でも利用可"      name="public"           checked={filters.public}                   onChange={handleFilterChange} />
          </div>
        </section>

        <section className="panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CategoryIcon color="primary" /> 施設の種類
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'normal' }}>（1つ選択）</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
            <label
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '12px', borderRadius: '12px', border: '1px solid #ddd', cursor: 'pointer',
                backgroundColor: facilityCategory === '' ? '#e3f2fd' : '#fff',
                borderColor:     facilityCategory === '' ? '#1e88e5' : '#eee',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="radio" name="facilityCategory" value=""
                checked={facilityCategory === ''}
                onChange={(e) => setFacilityCategory(e.target.value)}
                style={{ display: 'none' }}
              />
              <span style={{ fontWeight: 'bold', color: facilityCategory === '' ? '#1e88e5' : '#666' }}>指定なし</span>
            </label>

            {categoryOptions.map(opt => (
              <label
                key={opt.val}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '12px', borderRadius: '12px', border: '1px solid #ddd', cursor: 'pointer',
                  backgroundColor: facilityCategory === opt.val ? '#e3f2fd' : '#fff',
                  borderColor:     facilityCategory === opt.val ? '#1e88e5' : '#eee',
                  color:           facilityCategory === opt.val ? '#1e88e5' : '#555',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <input
                  type="radio" name="facilityCategory" value={opt.val}
                  checked={facilityCategory === opt.val}
                  onChange={(e) => setFacilityCategory(e.target.value)}
                  style={{ display: 'none' }}
                />
                <div style={{ marginBottom: '4px' }}>{opt.icon}</div>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </section>

      </div>

      <div style={{ marginTop: '40px', textAlign: 'center', position: 'sticky', bottom: '20px', zIndex: 10 }}>
        <button
          className="btn btn-primary"
          onClick={handleSearch}
          style={{
            maxWidth: '400px',
            boxShadow: '0 8px 25px rgba(30,136,229,0.4)',
            height: '56px',
            fontSize: '1.1rem'
          }}
        >
          <SearchIcon sx={{ mr: 1 }} />
          この条件で検索する
        </button>
      </div>

    </main>
  );
}

function FilterChip({ label, name, checked, onChange, highlight }) {
  return (
    <label
      className="chip"
      style={{
        backgroundColor: checked ? (highlight ? '#e3f2fd' : '#f0f4f8') : '#fff',
        borderColor:  checked ? '#1e88e5' : '#ddd',
        color:        checked ? '#1e88e5' : '#444',
        fontWeight:   checked ? 'bold' : 'normal',
        padding: '10px 16px',
        margin: '0',
        borderRadius: '99px',
        borderWidth: '1px',
        borderStyle: 'solid',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ display: 'none' }}
      />
      {checked && <CheckIcon fontSize="inherit" />}
      <span>{label}</span>
    </label>
  );
}

export default Conditions;