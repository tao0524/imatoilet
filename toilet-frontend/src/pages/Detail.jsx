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

// --- 追加アイコン ---
import ChildCareIcon from '@mui/icons-material/ChildCare';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import CategoryIcon from '@mui/icons-material/Category';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toilet, setToilet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cleanliness, setCleanliness] = useState(null);
  const [displayDesc, setDisplayDesc] = useState("");

  const FAV_KEY = "imatoilet_favorites";

  useEffect(() => {
    async function fetchToilet() {
      // 1. ローカルデータから検索
      if (id.startsWith('u_')) {
        const userToilets = loadUserToilets();
        const found = userToilets.find(t => t.id === id);
        processToiletData(found);
      } else {
        // 2. APIから検索
        try {
          const res = await fetch(API_BASE_URL);
          const data = await res.json();
          const found = data.find(t => String(t.id) === id);
          processToiletData(found);
        } catch (error) {
          console.error("Fetch error:", error);
          setLoading(false);
        }
      }
      
      const favs = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
      setIsFavorite(favs.includes(id));
    }

    // データ受信後の処理
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

  // 削除ハンドラ
  const handleDelete = async () => {
    if (!window.confirm("本当にこのトイレ情報を削除しますか？\n（この操作は取り消せません）")) {
      return;
    }

    try {
      if (id.startsWith('u_')) {
        // ローカルデータの削除
        const current = loadUserToilets();
        const next = current.filter(t => t.id !== id);
        saveUserToilets(next);
        alert("削除しました（ブラウザ保存データ）");
        navigate('/search');
      } else {
        // APIデータの削除
        const res = await fetch(`${API_BASE_URL}/${id}`, {
          method: "DELETE",
        });
        
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

  const googleMapUrl = `https://www.google.com/maps/search/?api=1&query=${toilet.lat},${toilet.lng}`;

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

  return (
    <main className="detail-main">
      <div className="container">
        
        <div className="detail-nav">
          <Link to="/search" className="back-link">
            <ArrowBackIcon fontSize="small" /> 検索結果に戻る
          </Link>
        </div>

        <article className="detail-card">
          
          {/* 画像エリア（左側になる予定） */}
          {toilet.image && (
            <div className="detail-image">
              <img src={toilet.image} alt={toilet.name} />
            </div>
          )}

          {/* ★追加: 文字情報をまとめるラッパー（右側になる予定） */}
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

            <footer className="detail-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href={googleMapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn">
                <DirectionsIcon sx={{mr: 1}} />
                Googleマップでナビ開始
              </a>

              <button 
                onClick={() => navigate(`/edit/${id}`)}
                style={{ 
                  background: '#fff', 
                  border: '1px solid #1e88e5', 
                  color: '#1e88e5', 
                  padding: '12px', 
                  borderRadius: '14px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <EditIcon sx={{ mr: 1 }} />
                情報を編集する
              </button>

              <button 
                onClick={handleDelete}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #ef5350', 
                  color: '#ef5350', 
                  padding: '12px', 
                  borderRadius: '14px', 
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '0px'
                }}
              >
                <DeleteForeverIcon sx={{ mr: 1 }} />
                この情報を削除する
              </button>
            </footer>

          </div>{/* detail-content end */}

        </article>
      </div>
    </main>
  );
}

export default Detail;