import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadUserToilets } from '../utils'; // 自分で登録したデータを読み込む関数
import './Favorites.css'; // さっき作ったCSSを読み込み
import { API_BASE_URL } from '../config/api';

// アイコン素材の読み込み
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SortIcon from '@mui/icons-material/Sort';

function Favorites() {
  // --- 状態管理 (State) ---
  const [favorites, setFavorites] = useState([]); // 表示するトイレデータ一覧
  const [loading, setLoading] = useState(true);   // 読み込み中かどうか
  const [sortMode, setSortMode] = useState('updated'); // 並び順 ('updated' か 'name')
  
  const navigate = useNavigate(); // ページ移動用
  const FAV_KEY = "imatoilet_favorites"; // LocalStorageの保存キー名

  // --- 1. 画面が開かれたときの処理 ---
  useEffect(() => {
    async function fetchFavorites() {
      // (1) LocalStorageから「お気に入り登録したIDのリスト」だけ取り出す
      const favIds = JSON.parse(localStorage.getItem(FAV_KEY)) || [];

      if (favIds.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      // (2) IDを「ローカル用(u_始まり)」と「バックエンド用」に分別
      const localIds = favIds.filter(id => String(id).startsWith('u_'));
      const backendIds = favIds.filter(id => !String(id).startsWith('u_'));

      let loadedToilets = [];

      // A. ローカルデータの取得
      // (全ローカルデータから、お気に入りIDに一致するものだけ抽出)
      if (localIds.length > 0) {
        const userToilets = loadUserToilets();
        const foundLocal = userToilets.filter(t => localIds.includes(String(t.id)));
        loadedToilets = [...loadedToilets, ...foundLocal];
      }

      // B. バックエンドデータの取得 (ID指定で並列取得)
      if (backendIds.length > 0) {
        try {
          // IDごとに個別にfetchする「約束(Promise)」のリストを作る
          const promises = backendIds.map(async (id) => {
            try {
              const res = await fetch(`${API_BASE_URL}/${id}`);
              if (res.ok) {
                return await res.json();
              }
              return null; // 削除済みなどで見つからない場合
            } catch (err) {
              console.error(`Fetch failed for ID ${id}:`, err);
              return null;
            }
          });

          // Promise.allで並列実行し、全ての結果が揃うのを待つ
          const apiResults = await Promise.all(promises);
          
          // null(エラーや削除済み)を除外してリストに追加
          const foundApi = apiResults.filter(item => item !== null);
          loadedToilets = [...loadedToilets, ...foundApi];

        } catch (err) {
          console.error("API Error:", err);
        }
      }

      // (3) 結果を画面にセット
      setFavorites(loadedToilets);
      setLoading(false);
    }

    fetchFavorites();
  }, []);

  // --- 2. 並び替え処理 ---
  const getSortedFavorites = () => {
    // 元の配列を壊さないように [...favorites] でコピーしてからソート
    return [...favorites].sort((a, b) => {
      if (sortMode === 'name') {
        // 名前順 (あいうえお順)
        return (a.name || "").localeCompare(b.name || "", "ja");
      } else {
        // 更新日順 (日付文字列の比較)
        // データがない場合は古いものとして扱う
        const dateA = a.updatedAt || "0000-00-00";
        const dateB = b.updatedAt || "0000-00-00";
        return dateB.localeCompare(dateA); // 降順（新しい順）
      }
    });
  };

  // --- 3. 削除処理 ---
  const handleRemove = (id) => {
    if(!window.confirm("このトイレをお気に入りから削除しますか？")) return;

    // 画面上のリストから削除
    const nextFavs = favorites.filter(t => String(t.id) !== String(id));
    setFavorites(nextFavs);

    // LocalStorageのIDリストからも削除
    const currentIds = JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    const nextIds = currentIds.filter(favId => favId !== String(id));
    localStorage.setItem(FAV_KEY, JSON.stringify(nextIds));
  };

  // --- 4. 全削除処理 ---
  const handleClearAll = () => {
    if(!window.confirm("お気に入りをすべて削除しますか？")) return;
    setFavorites([]); // 画面を空に
    localStorage.setItem(FAV_KEY, JSON.stringify([])); // 保存データも空に
  };

  if (loading) return <div className="container" style={{padding:'20px'}}>読み込み中...</div>;

  // 並び替え済みのデータを用意
  const sortedItems = getSortedFavorites();

  return (
    <main className="fav-main">
      <div className="container">
        
        {/* 上部ナビ */}
        <div style={{ marginBottom: '16px' }}>
          <Link to="/" className="back-link" style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#666', textDecoration:'none' }}>
            <ArrowBackIcon fontSize="small" /> トップに戻る
          </Link>
        </div>

        <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>⭐ よく使うトイレ</h2>

        {/* 操作パネル */}
        <section className="fav-controls">
          <label className="select-wrap">
            <span style={{ display:'flex', alignItems:'center', gap:'6px' }}>
              <SortIcon color="action" /> 並び替え
            </span>
            <select 
              className="select-sort" 
              value={sortMode} 
              onChange={(e) => setSortMode(e.target.value)}
            >
              <option value="updated">更新日が新しい順</option>
              <option value="name">名前順</option>
            </select>
          </label>

          {favorites.length > 0 && (
            <button className="btn btn-sub btn-sm" onClick={handleClearAll}>
              🗑 お気に入りを全削除
            </button>
          )}
        </section>

        {/* リスト表示エリア */}
        <section className="list-area">
          {sortedItems.length === 0 ? (
            <div className="fav-empty">
              <p>お気に入りがありません。</p>
              <p style={{ fontSize:'0.9rem', marginTop:'10px' }}>
                検索結果や詳細ページから<br/>「⭐追加」ボタンを押すとここに表示されます。
              </p>
              <Link to="/search" className="btn btn-primary btn-sm" style={{ marginTop:'20px', display:'inline-block', width:'auto' }}>
                トイレを探しに行く
              </Link>
            </div>
          ) : (
            sortedItems.map(toilet => (
              <article key={toilet.id} className="fav-card">
                <div className="fav-card-name">{toilet.name}</div>
                
                <div className="fav-card-meta">
                  {toilet.wheelchair && <span>♿ 車椅子</span>}
                  {toilet.diaper && <span>👶 オムツ</span>}
                  {toilet.open24h && <span>🕒 24時間</span>}
                  {!toilet.wheelchair && !toilet.diaper && !toilet.open24h && <span>設備情報なし</span>}
                </div>

                <div className="fav-card-actions">
                  {/* 詳細ボタン：クリックで詳細ページへ移動 */}
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => navigate(`/detail/${toilet.id}`)}
                    style={{ flex: 1 }}
                  >
                    <VisibilityIcon fontSize="small" style={{marginRight:4}} /> 詳細
                  </button>
                  
                  {/* 削除ボタン */}
                  <button 
                    className="btn btn-danger-outline" 
                    onClick={() => handleRemove(toilet.id)}
                  >
                    <DeleteOutlineIcon fontSize="small" /> 削除
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

      </div>
    </main>
  );
}

export default Favorites;