import '../base.css';
import '../components.css';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { loadUserToilets, saveUserToilets } from '../utils';
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

// 追加アイコン
import ChildCareIcon from '@mui/icons-material/ChildCare';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// ★ライトボックス用アイコン
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toilet, setToilet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cleanliness, setCleanliness] = useState(null);
  const [displayDesc, setDisplayDesc] = useState("");

  // ★ライトボックス用の状態管理 (開いている画像のインデックス。nullなら閉じている)
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const FAV_KEY = "imatoilet_favorites";

  useEffect(() => {
    async function fetchToilet() {
      if (id.startsWith('u_')) {
        const userToilets = loadUserToilets();
        const found = userToilets.find(t => t.id === id);
        processToiletData(found);
      } else {
        try {
          // ★変更: IDを指定して1件だけ取得する (N+1問題の解消)
          const res = await fetch(`${API_BASE_URL}/${id}`);
          if (res.ok) {
            const data = await res.json();
            processToiletData(data);
          } else {
            // 404などのエラーハンドリング
            console.error("Toilet not found");
            setLoading(false);
          }
        } catch (error) {
          console.error("Fetch error:", error);
          setLoading(false);
        }
      }
      
      const favs = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
      setIsFavorite(favs.includes(id));
    }

    function processToiletData(data) {
      if (!data) {
        setToilet(null);
        setLoading(false);
        return;
      }
      setCleanliness(data.cleanliness || 0); 
      setDisplayDesc(data.description || ""); 
      setToilet(data);
      setLoading(false);
    }

    fetchToilet();
  }, [id]);

  // ★キーボード操作でライトボックスを閉じる/移動する
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') nextImage(e);
      if (e.key === 'ArrowLeft') prevImage(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]); // lightboxIndexが変わるたびにイベントリスナーを更新

  const toggleFavorite = () => {
    let favs = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    if (isFavorite) {
      favs = favs.filter(favId => favId !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    setIsFavorite(!isFavorite);
  };

  const handleDelete = async () => {
    if (!window.confirm("本当にこのトイレ情報を削除しますか？\n（この操作は取り消せません）")) {
      return;
    }
    try {
      if (id.startsWith('u_')) {
        const current = loadUserToilets();
        const next = current.filter(t => t.id !== id);
        saveUserToilets(next);
        alert("削除しました（ブラウザ保存データ）");
        navigate('/search');
      } else {
        const res = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
        if (res.ok) {
          alert("削除しました");
          navigate('/search');
        } else {
          alert("削除に失敗しました");
        }
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }
  };

  if (loading) return <div className="container" style={{padding:'20px'}}>読み込み中...</div>;
  if (!toilet) return <div className="container" style={{padding:'20px'}}>データが見つかりませんでした。<br /><Link to="/search">検索に戻る</Link></div>;

  const googleMapUrl = `http://googleusercontent.com/maps.google.com/maps?q=${toilet.lat},${toilet.lng}`;

  const categoryMap = {
    station: '駅・交通',
    commercial: '商業施設',
    convenience: 'コンビニ・店',
    park: '公園・屋外',
    public: '公共施設',
    medical: '医療・福祉',
    hotel_tourism: '観光・宿泊',
    other: 'その他'
  };

  const eqList = toilet.equipment ? toilet.equipment.split(',').filter(Boolean) : [];
  const hasAnyEquipment = toilet.wheelchair || toilet.diaper || toilet.open24h || eqList.length > 0;
  const images = toilet.image ? toilet.image.split(',').filter(url => url.trim() !== "") : [];

  // --- ライトボックス操作関数 ---
  const openLightbox = (index) => setLightboxIndex(index);
  
  const nextImage = (e) => {
    e && e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e && e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <main className="detail-main">
      <div className="container">
        
        <div className="detail-nav">
          <button 
            onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/search')}
            className="back-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <ArrowBackIcon fontSize="small" /> 前の画面に戻る
          </button>
        </div>

        <article className="detail-card">
          
          {/* 画像表示エリア */}
          {images.length > 0 && (
            <div className="detail-image" style={{ background: '#f5f5f5' }}>
              {images.length === 1 ? (
                // 1枚だけの場合：ファーストビューの可能性が高いため lazy は付けず、asyncのみ
                <img 
                  src={images[0]} 
                  alt={toilet.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => openLightbox(0)} // クリックで拡大
                  decoding="async"
                />
              ) : (
                // 複数枚の場合（横スクロール）：画面外の画像は遅延読み込み
                <div style={{ 
                  display: 'flex', 
                  overflowX: 'auto', 
                  gap: '10px', 
                  padding: '10px',
                  scrollSnapType: 'x mandatory',
                  height: '100%',
                  alignItems: 'center'
                }}>
                  {images.map((imgUrl, idx) => (
                    <img 
                      key={idx} 
                      src={imgUrl} 
                      alt={`${toilet.name} - ${idx + 1}`} 
                      style={{ 
                        flexShrink: 0, 
                        width: '85%', 
                        height: 'auto', 
                        maxHeight: '100%', 
                        objectFit: 'contain',
                        borderRadius: '8px',
                        scrollSnapAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        background: '#fff',
                        cursor: 'pointer' // クリックできることを示す
                      }} 
                      onClick={() => openLightbox(idx)} // クリックで拡大
                      loading="lazy"
                      decoding="async"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="detail-content">
            <header className="detail-header">
              <div>
                <h1 className="detail-title">{toilet.name}</h1>
                {cleanliness > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: '#ffb400', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      star <= cleanliness ? <StarIcon key={star} fontSize="small" /> : <StarBorderIcon key={star} fontSize="small" />
                    ))}
                    <span style={{ fontSize: '0.85rem', color: '#666', marginLeft: '6px' }}>
                      (清潔度: {cleanliness})
                    </span>
                  </div>
                )}
              </div>
              <button className="fav-btn" onClick={toggleFavorite}>
                {isFavorite ? <StarIcon sx={{color: '#ffc107'}} /> : <StarBorderIcon />}
                <span>{isFavorite ? '登録済み' : 'お気に入り'}</span>
              </button>
            </header>

            <div className="detail-tags">
               {toilet.facilityCategory && categoryMap[toilet.facilityCategory] && (
                 <span className="tag" style={{background:'#e3f2fd', color:'#0d47a1', border:'1px solid #bbdefb', fontWeight:'bold'}}>
                   <CategoryIcon fontSize="small" /> {categoryMap[toilet.facilityCategory]}
                 </span>
               )}
               {eqList.includes('parking') && (
                 <span className="tag tag-ok" style={{background:'#e8f5e9', color:'#2e7d32', borderColor:'#c8e6c9'}}>
                   <DirectionsCarIcon fontSize="small"/> 駐車場あり
                 </span>
               )}
               {toilet.wheelchair && <span className="tag tag-ok"><AccessibleIcon fontSize="small"/> 車椅子OK</span>}
               {toilet.diaper && <span className="tag tag-ok"><BabyChangingStationIcon fontSize="small"/> オムツ替え</span>}
               {toilet.open24h && <span className="tag tag-ok"><AccessTimeIcon fontSize="small"/> 24時間</span>}
               {eqList.includes('ostomate') && <span className="tag tag-ok"><MedicalServicesIcon fontSize="small"/> オストメイト</span>}
               {eqList.includes('nursing_room') && <span className="tag tag-ok"><ChildCareIcon fontSize="small"/> 授乳室</span>}
               {eqList.includes('washlet') && <span className="tag tag-ok"><WaterDropIcon fontSize="small"/> ウォシュレット</span>}
               {eqList.includes('gender_separated') && <span className="tag tag-ok"><WcIcon fontSize="small"/> 男女別</span>}
               {eqList.includes('free') && <span className="tag tag-ok"><MoneyOffIcon fontSize="small"/> 無料</span>}
               {!hasAnyEquipment && !eqList.includes('parking') && <span className="tag">設備情報なし</span>}
            </div>

            <section className="detail-info">
              <h3 className="info-label">住所</h3>
              <p className="info-text">{toilet.address || "不明"}</p>
              <h3 className="info-label">詳細・備考</h3>
              <p className="info-text">{displayDesc || "情報なし"}</p>
            </section>

            <footer className="detail-actions">
              <a href={googleMapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn">
                <DirectionsIcon sx={{mr: 1}} />
                Googleマップでナビ開始
              </a>
              <button 
                onClick={() => navigate(`/edit/${id}`)}
                style={{ 
                  background: '#fff', border: '1px solid #1e88e5', color: '#1e88e5', 
                  padding: '12px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <EditIcon sx={{ mr: 1 }} /> 情報を編集する
              </button>
              <button 
                onClick={handleDelete}
                style={{ 
                  background: 'transparent', border: '1px solid #ef5350', color: '#ef5350', 
                  padding: '12px', borderRadius: '14px', fontWeight: 'bold', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0px'
                }}
              >
                <DeleteForeverIcon sx={{ mr: 1 }} /> この情報を削除する
              </button>
            </footer>
          </div>
        </article>

        {/* ★ここから: ライトボックス(拡大表示)モーダル */}
        {lightboxIndex !== null && (
          <div 
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)', zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '20px'
            }}
            onClick={() => setLightboxIndex(null)} // 背景クリックで閉じる
          >
            {/* 閉じるボタン */}
            <button
              onClick={() => setLightboxIndex(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
                color: '#fff', width: '44px', height: '44px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10001
              }}
            >
              <CloseIcon fontSize="large" />
            </button>

            {/* 前へボタン (画像が2枚以上あるときだけ表示) */}
            {images.length > 1 && (
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute', left: '10px',
                  background: 'transparent', border: 'none',
                  color: '#fff', cursor: 'pointer', zIndex: 10001,
                  padding: '20px'
                }}
              >
                <ArrowBackIosNewIcon fontSize="large" />
              </button>
            )}

            {/* 画像本体：ライトボックスは即表示したいのでlazyなし、ただしasyncは付ける */}
            <img 
              src={images[lightboxIndex]} 
              alt="拡大表示"
              style={{
                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                userSelect: 'none'
              }}
              onClick={(e) => e.stopPropagation()} // 画像クリックでは閉じない
              decoding="async"
            />

            {/* 次へボタン (画像が2枚以上あるときだけ表示) */}
            {images.length > 1 && (
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute', right: '10px',
                  background: 'transparent', border: 'none',
                  color: '#fff', cursor: 'pointer', zIndex: 10001,
                  padding: '20px'
                }}
              >
                <ArrowForwardIosIcon fontSize="large" />
              </button>
            )}

            {/* 枚数カウント表示 */}
            {images.length > 1 && (
              <div style={{
                position: 'absolute', bottom: '20px',
                color: '#fff', fontSize: '1rem', background: 'rgba(0,0,0,0.5)',
                padding: '4px 12px', borderRadius: '20px'
              }}>
                {lightboxIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
        {/* ★ここまで */}

      </div>
    </main>
  );
}

export default Detail;