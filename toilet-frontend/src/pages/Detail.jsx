import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadUserToilets } from '../utils';

// アイコンのインポート
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';
import BabyChangingStationIcon from '@mui/icons-material/BabyChangingStation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// --- 追加アイコン（新機能用） ---
import ChildCareIcon from '@mui/icons-material/ChildCare';         // 授乳室
import MedicalServicesIcon from '@mui/icons-material/MedicalServices'; // オストメイト
import WaterDropIcon from '@mui/icons-material/WaterDrop';         // ウォシュレット
import MoneyOffIcon from '@mui/icons-material/MoneyOff';           // 無料
import CategoryIcon from '@mui/icons-material/Category';           // カテゴリ

function Detail() {
  const { id } = useParams(); // URLからIDを取得
  const [toilet, setToilet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // お気に入りの読み込みキー
  const FAV_KEY = "imatoilet_favorites";

  useEffect(() => {
    async function fetchToilet() {
      // 1. ローカルデータ（ユーザー登録分）から検索
      // IDが "u_" で始まる場合はローカルデータ
      if (id.startsWith('u_')) {
        const userToilets = loadUserToilets();
        const found = userToilets.find(t => t.id === id);
        setToilet(found);
        setLoading(false);
      } else {
        // 2. バックエンドAPIから検索
        try {
          // IDは数値型に変換して比較する必要があるかも知れませんが、APIパスは文字列でOK
          const res = await fetch(`http://localhost:8080/api/toilets`);
          const data = await res.json();
          // APIには個別のGETエンドポイントを作っていないため、全件から探します
          const found = data.find(t => String(t.id) === id);
          setToilet(found);
        } catch (error) {
          console.error("Fetch error:", error);
        } finally {
          setLoading(false);
        }
      }
      
      // お気に入り状態の確認
      const favs = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
      setIsFavorite(favs.includes(id));
    }

    fetchToilet();
  }, [id]);

  // お気に入り切り替え処理
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

  if (loading) return <div className="container" style={{padding:'20px'}}>読み込み中...</div>;
  if (!toilet) return <div className="container" style={{padding:'20px'}}>データが見つかりませんでした。<br /><Link to="/search">検索に戻る</Link></div>;

  // Googleマップのナビ用URL
  const googleMapUrl = `https://www.google.com/maps/dir/?api=1&destination=${toilet.lat},${toilet.lng}`;

  // --- 新機能：データ解析 ---
  // 1. 施設カテゴリの日本語マッピング
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

  // 2. equipment文字列（カンマ区切り）を配列に変換
  const eqList = toilet.equipment ? toilet.equipment.split(',').filter(Boolean) : [];

  // 3. 設備があるかどうかの判定（既存フラグ + 新リスト）
  const hasAnyEquipment = toilet.wheelchair || toilet.diaper || toilet.open24h || eqList.length > 0;

  return (
    <main className="detail-main">
      <div className="container">
        
        {/* ナビゲーション */}
        <div className="detail-nav">
          <Link to="/search" className="back-link">
            <ArrowBackIcon fontSize="small" /> 検索結果に戻る
          </Link>
        </div>

        {/* メインカード */}
        <article className="detail-card">
          
          {/* 画像（あれば表示） */}
          {toilet.image && (
            <div className="detail-image">
              <img src={toilet.image} alt={toilet.name} />
            </div>
          )}

          <header className="detail-header">
            <h1 className="detail-title">{toilet.name}</h1>
            <button className="fav-btn" onClick={toggleFavorite}>
              {isFavorite ? <StarIcon sx={{color: '#ffc107'}} /> : <StarBorderIcon />}
              <span>{isFavorite ? '登録済み' : 'お気に入り'}</span>
            </button>
          </header>

          <div className="detail-tags">
             {/* --- 新機能：施設カテゴリ表示 --- */}
             {toilet.facilityCategory && categoryMap[toilet.facilityCategory] && (
               <span className="tag" style={{background:'#e3f2fd', color:'#0d47a1', border:'1px solid #bbdefb', fontWeight:'bold'}}>
                 <CategoryIcon fontSize="small" /> {categoryMap[toilet.facilityCategory]}
               </span>
             )}

             {/* --- 既存設備アイコン (Booleanフラグ準拠) --- */}
             {toilet.wheelchair && <span className="tag tag-ok"><AccessibleIcon fontSize="small"/> 車椅子OK</span>}
             {toilet.diaper && <span className="tag tag-ok"><BabyChangingStationIcon fontSize="small"/> オムツ替え</span>}
             {toilet.open24h && <span className="tag tag-ok"><AccessTimeIcon fontSize="small"/> 24時間</span>}

             {/* --- 新機能：追加設備アイコン (equipment文字列解析) --- */}
             {eqList.includes('ostomate') && <span className="tag tag-ok"><MedicalServicesIcon fontSize="small"/> オストメイト</span>}
             {eqList.includes('nursing_room') && <span className="tag tag-ok"><ChildCareIcon fontSize="small"/> 授乳室</span>}
             {eqList.includes('washlet') && <span className="tag tag-ok"><WaterDropIcon fontSize="small"/> ウォシュレット</span>}
             {eqList.includes('gender_separated') && <span className="tag tag-ok"><WcIcon fontSize="small"/> 男女別</span>}
             {eqList.includes('free') && <span className="tag tag-ok"><MoneyOffIcon fontSize="small"/> 無料</span>}

             {/* 設備情報なしの場合 */}
             {!hasAnyEquipment && <span className="tag">設備情報なし</span>}
          </div>

          <section className="detail-info">
            <h3 className="info-label">住所</h3>
            <p className="info-text">{toilet.address || "不明"}</p>

            <h3 className="info-label">詳細・備考</h3>
            <p className="info-text">{toilet.description || "情報なし"}</p>
          </section>

          {/* アクションボタン */}
          <footer className="detail-actions">
            <a href={googleMapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary nav-btn">
              <DirectionsIcon sx={{mr: 1}} />
              Googleマップでナビ開始
            </a>
          </footer>

        </article>
      </div>
    </main>
  );
}

export default Detail;