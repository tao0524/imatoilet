import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // CSS読み込み

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

function Register() {
  const navigate = useNavigate();
  const mapRef = useRef(null);      // 地図インスタンス保持用
  const markerRef = useRef(null);   // ピン（マーカー）保持用

  // フォームの状態管理
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    lat: '',
    lng: '',
    wheelchair: false,
    diaper: false,
    open24h: false
  });

  const [loading, setLoading] = useState(false);

  // --- 1. 地図の初期化 ---
  useEffect(() => {
    // 地図がまだなければ作成
    if (!mapRef.current && window.L) {
      // つくば駅中心に表示
      const map = window.L.map('reg-map').setView([36.0825, 140.1120], 14);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      mapRef.current = map;

      // 地図クリック時のイベント
      map.on('click', (e) => {
        handleMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // クリーンアップ（画面移動時に地図を消す）
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // --- 2. 地図クリック時の処理 ---
  const handleMapClick = (lat, lng) => {
    const map = mapRef.current;
    if (!map) return;

    // 既存のピンがあれば消す
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // 新しいピンを立てる
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // フォームの座標を更新
    setFormData(prev => ({ ...prev, lat: lat, lng: lng }));

    // ピンをドラッグしたときも座標更新
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
    });
  };

  // --- 3. 入力変更ハンドラ ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // --- 4. 送信処理 (APIへPOST) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      alert("地図をタップして、場所（ピン）を指定してください！");
      return;
    }

    if (!confirm("この内容で登録しますか？")) return;

    setLoading(true);

    try {
      // APIへ送信
      const res = await fetch('http://localhost:8080/api/toilets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("登録しました！");
        navigate('/search'); // 検索画面へ戻る
      } else {
        alert("登録に失敗しました。サーバーエラーです。");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました。バックエンドが起動しているか確認してください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="container">
        
        {/* ヘッダー */}
        <div style={{ marginBottom: '20px' }}>
          <Link to="/" style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#666', textDecoration:'none' }}>
            <ArrowBackIcon fontSize="small" /> トップに戻る
          </Link>
          <h1 style={{ marginTop:'10px', fontSize:'1.5rem' }}>トイレを登録する</h1>
        </div>

        <form className="register-grid" onSubmit={handleSubmit}>
          
          {/* 左カラム：地図 */}
          <section className="panel panel--map">
            <div className="panel__head panel__head--tight">
              <h2 className="panel__title panel__title--small">1. 場所を指定 <span className="req">必須</span></h2>
              <p className="panel__sub">地図をタップしてピンを立ててください</p>
            </div>
            
            <div id="reg-map" className="reg-map-area"></div>

            <div className="map-hint">
              <span className="dot"></span>
              {formData.lat ? (
                <span>選択中: {Number(formData.lat).toFixed(5)}, {Number(formData.lng).toFixed(5)}</span>
              ) : (
                <span>地図をタップしてください</span>
              )}
            </div>
          </section>

          {/* 右カラム：入力フォーム */}
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">2. トイレの情報</h2>
            </div>

            <div className="panel__body">
              <div className="form-row">
                <label className="form-label">名前 <span className="req">必須</span></label>
                <input 
                  type="text" 
                  name="name" 
                  className="input" 
                  placeholder="例：つくば駅前公衆トイレ" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className="form-row">
                <label className="form-label">住所・場所の目安</label>
                <input 
                  type="text" 
                  name="address" 
                  className="input" 
                  placeholder="例：ロータリーの近く" 
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <label className="form-label">説明・メモ</label>
                <textarea 
                  name="description" 
                  className="textarea" 
                  rows="3" 
                  placeholder="例：きれいで使いやすいです。"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="form-row">
                <label className="form-label">設備情報</label>
                <div className="checks">
                  <label className="check-label">
                    <input type="checkbox" name="wheelchair" checked={formData.wheelchair} onChange={handleChange} />
                    ♿ 車椅子対応
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="diaper" checked={formData.diaper} onChange={handleChange} />
                    👶 オムツ替え
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="open24h" checked={formData.open24h} onChange={handleChange} />
                    🕒 24時間
                  </label>
                </div>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <AddLocationAltIcon sx={{ mr: 1 }} />
                  {loading ? '送信中...' : '登録する'}
                </button>
              </div>
            </div>
          </section>

        </form>
      </div>
    </main>
  );
}

export default Register;
