import '../base.css';
import '../components.css';
import './Detail.css';
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadUserToilets, saveUserToilets, normalizeEquipment } from '../utils'; // ★normalizeEquipment追加
import { API_BASE_URL } from '../config/api';

// アイコンのインポート
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ChairIcon from '@mui/icons-material/Chair'; // ★ベビーチェア用アイコン追加

// ライトボックス用アイコン
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toilet, setToilet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    async function fetchToilet() {
      if (id.startsWith('u_')) {
        const userToilets = loadUserToilets();
        const found = userToilets.find(t => t.id === id);
        setToilet(found || null);
        setLoading(false);
      } else {
        try {
          const res = await fetch(`${API_BASE_URL}/${id}`);
          if (res.ok) {
            setToilet(await res.json());
          } else {
            setToilet(null);
          }
        } catch (error) {
          console.error('Fetch error:', error);
          setToilet(null);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchToilet();

    const favs = JSON.parse(localStorage.getItem('imatoilet_favorites') || '[]');
    setIsFavorite(favs.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem('imatoilet_favorites') || '[]');
    favs = isFavorite ? favs.filter(fid => fid !== id) : [...favs, id];
    localStorage.setItem('imatoilet_favorites', JSON.stringify(favs));
    setIsFavorite(!isFavorite);
  };

  const handleDelete = async () => {
    if (!window.confirm('本当にこのトイレ情報を削除しますか？\n（この操作は取り消せません）')) return;
    try {
      if (id.startsWith('u_')) {
        saveUserToilets(loadUserToilets().filter(t => t.id !== id));
        alert('削除しました（ブラウザ保存データ）');
        navigate('/search');
      } else {
        const res = await fetch(`${API_BASE_URL}/${id}`, { 
          method: 'DELETE',
          headers: {
            'X-Admin-Token': import.meta.env.VITE_ADMIN_TOKEN
          }
        });
        if (res.ok) { alert('削除しました'); navigate('/search'); }
        else alert('削除に失敗しました');
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました');
    }
  };

  const openGoogleMaps = () => {
    if (!toilet) return;
    window.open(`https://www.google.com/maps?q=${toilet.lat},${toilet.lng}`, '_blank');
  };

  const images = toilet?.image ? toilet.image.split(',').filter(u => u.trim() !== '') : [];

  const openLightbox  = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setLightboxIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape')     closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft')  prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  if (loading) return <div className="container" style={{ padding: '20px' }}>読み込み中...</div>;
  if (!toilet) return (
    <div className="container" style={{ padding: '20px' }}>
      データが見つかりませんでした。<br /><Link to="/search">検索に戻る</Link>
    </div>
  );

  const categoryMap = {
    station:       '駅・交通',
    commercial:    '商業施設',
    convenience:   'コンビニ・店',
    park:          '公園・屋外',
    public:        '公共施設',
    medical:       '医療・福祉',
    hotel_tourism: '観光・宿泊',
    other:         'その他'
  };

  // ★修正: インラインのeqList/has() を廃止し normalizeEquipment() に統一
  const eqSet = normalizeEquipment(toilet);
  const has   = (key) => eqSet.has(key);
  const hasAnyEquipment = eqSet.size > 0;

  return (
    <main className="detail-main">
      <div className="container">

        <div className="detail-nav">
          <Link to="/search" className="back-link">
            <ArrowBackIcon fontSize="small" /> 検索に戻る
          </Link>
        </div>

        <div className="detail-card">
          {/* ヘッダー画像エリア */}
          <div className="detail-header-image" style={{ position: 'relative', height: '250px', backgroundColor: '#eee', overflow: 'hidden' }}>
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={toilet.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                onClick={() => openLightbox(0)}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                No Image
              </div>
            )}

            {/* お気に入りボタン */}
            <button
              onClick={toggleFavorite}
              style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
                width: '44px', height: '44px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: isFavorite ? '#ffc107' : '#bdbdbd'
              }}
              title="お気に入りに追加"
            >
              {isFavorite ? <StarIcon fontSize="medium" /> : <StarBorderIcon fontSize="medium" />}
            </button>
          </div>

          <div className="detail-content">
            <div style={{ marginBottom: '16px' }}>
              <h1 className="detail-title">{toilet.name}</h1>
              <p className="detail-address">{toilet.address || '住所未登録'}</p>
            </div>

            <div className="action-buttons">
              <button className="nav-btn" onClick={openGoogleMaps}>
                <DirectionsIcon sx={{ mr: 1 }} /> Googleマップでナビ
              </button>
              <button className="edit-btn" onClick={() => navigate(`/edit/${toilet.id}`)}>
                <EditIcon sx={{ mr: 1 }} fontSize="small" /> 情報を編集
              </button>
            </div>

            <div className="info-section">
              <h3>設備・特徴</h3>
              <div className="detail-tags">
                {toilet.facilityCategory && categoryMap[toilet.facilityCategory] && (
                  <span className="tag" style={{ background: '#e3f2fd', color: '#0d47a1', border: '1px solid #bbdefb', fontWeight: 'bold' }}>
                    <CategoryIcon fontSize="small" /> {categoryMap[toilet.facilityCategory]}
                  </span>
                )}
                {has('PARKING') && (
                  <span className="tag tag-ok" style={{ background: '#e8f5e9', color: '#2e7d32', borderColor: '#c8e6c9' }}>
                    <DirectionsCarIcon fontSize="small" /> 駐車場あり
                  </span>
                )}
                {has('WHEELCHAIR')       && <span className="tag tag-ok"><AccessibleIcon fontSize="small" /> 車椅子OK</span>}
                {has('DIAPER')           && <span className="tag tag-ok"><BabyChangingStationIcon fontSize="small" /> オムツ替え</span>}
                {has('OPEN_24H')         && <span className="tag tag-ok"><AccessTimeIcon fontSize="small" /> 24時間</span>}
                {has('OSTOMATE')         && <span className="tag tag-ok"><MedicalServicesIcon fontSize="small" /> オストメイト</span>}
                {has('NURSING_ROOM')     && <span className="tag tag-ok"><ChildCareIcon fontSize="small" /> 授乳室</span>}
                {/* ★追加: BABY_CHAIR の表示タグ */}
                {has('BABY_CHAIR')       && <span className="tag tag-ok"><ChairIcon fontSize="small" /> ベビーチェア</span>}
                {has('WASHLET')          && <span className="tag tag-ok"><WaterDropIcon fontSize="small" /> ウォシュレット</span>}
                {has('GENDER_SEPARATED') && <span className="tag tag-ok"><WcIcon fontSize="small" /> 男女別</span>}
                {has('FREE')             && <span className="tag tag-ok"><MoneyOffIcon fontSize="small" /> 無料</span>}
                {!hasAnyEquipment && <span className="tag">設備情報なし</span>}
              </div>
            </div>

            <div className="info-section">
              <h3>詳細情報</h3>
              <p>{toilet.description || '説明はありません。'}</p>
              <div className="cleanliness-display">
                清潔度: {'⭐'.repeat(toilet.cleanliness || 3)} ({toilet.cleanliness || 3})
              </div>
            </div>

            {/* 写真ギャラリー */}
            {images.length > 1 && (
              <div className="info-section">
                <h3>写真ギャラリー</h3>
                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`photo-${idx}`}
                      style={{ height: '80px', borderRadius: '4px', cursor: 'pointer', border: idx === lightboxIndex ? '2px solid blue' : '1px solid #ddd' }}
                      onClick={() => openLightbox(idx)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 削除ボタン */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
              <button
                onClick={handleDelete}
                style={{
                  background: 'transparent', border: '1px solid #ef5350', color: '#ef5350',
                  padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem'
                }}
              >
                <DeleteForeverIcon fontSize="small" /> この情報を削除する
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ライトボックス */}
      {lightboxIndex !== null && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.9)', zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
              color: '#fff', width: '44px', height: '44px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <CloseIcon />
          </button>

          <img
            src={images[lightboxIndex]}
            alt="拡大表示"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 0 20px rgba(0,0,0,0.5)', userSelect: 'none' }}
            onClick={(e) => e.stopPropagation()}
            decoding="async"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{ position: 'absolute', left: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10001, padding: '20px' }}
              >
                <ArrowBackIosNewIcon fontSize="large" />
              </button>
              <button
                onClick={nextImage}
                style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10001, padding: '20px' }}
              >
                <ArrowForwardIosIcon fontSize="large" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', color: '#fff', fontSize: '1rem', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px' }}>
              {lightboxIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default Detail;