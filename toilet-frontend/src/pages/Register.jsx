import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; 

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'; // 駐車場用
import StarIcon from '@mui/icons-material/Star';       // 星（塗）
import StarBorderIcon from '@mui/icons-material/StarBorder'; // 星（枠）

function Register() {
  const navigate = useNavigate();
  const mapRef = useRef(null);      // 地図インスタンス
  const markerRef = useRef(null);   // ピン

  // --- フォームの状態管理 ---
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    lat: '',
    lng: '',
    
    // 新機能：清潔度（1〜5）
    cleanliness: 3, 

    // 新設計：施設カテゴリ (単一選択)
    facilityCategory: '', 
    
    // 新設計：設備・条件 (チェックボックス管理用)
    conditions: {
      wheelchair: false,
      diaper: false,
      open24h: false,
      ostomate: false,
      nursing_room: false,
      washlet: false,
      gender_separated: false,
      free: false,
      parking: false // ★追加：駐車場
    }
  });

  const [loading, setLoading] = useState(false);

  // 1. 地図の初期化
  useEffect(() => {
    if (!mapRef.current && window.L) {
      const map = window.L.map('reg-map').setView([36.0825, 140.1120], 14);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      mapRef.current = map;
      map.on('click', (e) => handleMapClick(e.latlng.lat, e.latlng.lng));
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // 2. 地図クリック処理
  const handleMapClick = (lat, lng) => {
    const map = mapRef.current;
    if (!map) return;
    if (markerRef.current) map.removeLayer(markerRef.current);
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    setFormData(prev => ({ ...prev, lat: lat, lng: lng }));
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
    });
  };

  // 3. 入力変更ハンドラ (階層データに対応)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // 設備チェックボックスの場合
    if (name in formData.conditions) {
      setFormData(prev => ({
        ...prev,
        conditions: {
          ...prev.conditions,
          [name]: checked
        }
      }));
    } else {
      // 通常のフィールド
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // 清潔度スターをクリックした時のハンドラ
  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, cleanliness: rating }));
  };

  // 4. 送信処理 (新データ形式に変換してPOST)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      alert("地図をタップして、場所（ピン）を指定してください！");
      return;
    }

    if (!confirm("この内容で登録しますか？")) return;

    setLoading(true);

    // --- 送信データの構築 ---
    // チェックがついている設備キーを配列化し、カンマ区切り文字列にする
    const equipmentList = Object.keys(formData.conditions).filter(key => formData.conditions[key]);
    const equipmentStr = equipmentList.join(',');

    // ★重要：清潔度を説明文に「隠しタグ」として埋め込む
    // 例: "改札横です。[clean:4]"
    const finalDescription = `${formData.description} [clean:${formData.cleanliness}]`;

    const payload = {
      name: formData.name,
      address: formData.address,
      description: finalDescription, // 加工後の説明文を送信
      lat: formData.lat,
      lng: formData.lng,
      
      // 新フィールド
      facilityCategory: formData.facilityCategory,
      equipment: equipmentStr,

      // 旧フィールド (互換性用)
      wheelchair: formData.conditions.wheelchair,
      diaper: formData.conditions.diaper,
      open24h: formData.conditions.open24h
    };

    try {
      const res = await fetch('http://localhost:8080/api/toilets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("登録しました！");
        navigate('/search');
      } else {
        alert("登録に失敗しました。サーバーエラーです。");
      }
    } catch (err) {
      console.error(err);
      alert("通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">
      <div className="container">
        
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
                <input type="text" name="name" className="input" placeholder="例：つくば駅前公衆トイレ" value={formData.name} onChange={handleChange} required />
              </div>

              {/* ★追加：清潔度入力 */}
              <div className="form-row">
                <label className="form-label">清潔度（5段階）</label>
                <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} onClick={() => handleStarClick(star)}>
                      {star <= formData.cleanliness ? (
                        <StarIcon sx={{ color: '#ffb400', fontSize: 32 }} />
                      ) : (
                        <StarBorderIcon sx={{ color: '#ccc', fontSize: 32 }} />
                      )}
                    </div>
                  ))}
                </div>
                <p style={{fontSize:'0.8rem', color:'#666', marginTop:'4px'}}>
                  {formData.cleanliness === 5 ? "最高に綺麗！" : 
                   formData.cleanliness === 4 ? "綺麗" :
                   formData.cleanliness === 3 ? "普通" :
                   formData.cleanliness === 2 ? "少し汚い" : "汚い"}
                </p>
              </div>

              <div className="form-row">
                <label className="form-label">施設タイプ <span className="req">必須</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop:'8px' }}>
                  {[
                     { val: 'station', label: '駅・交通' },
                     { val: 'commercial', label: '商業施設' },
                     { val: 'convenience', label: 'コンビニ・店' },
                     { val: 'park', label: '公園・屋外' },
                     { val: 'public', label: '公共施設' },
                     { val: 'medical', label: '医療・福祉' },
                     { val: 'hotel_tourism', label: '観光・宿泊' },
                     { val: 'other', label: 'その他' }
                  ].map(opt => (
                    <label key={opt.val} className="check-label" style={{ fontWeight: 'normal' }}>
                      <input 
                        type="radio" 
                        name="facilityCategory" 
                        value={opt.val} 
                        checked={formData.facilityCategory === opt.val} 
                        onChange={handleChange}
                        required
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">設備・特徴</label>
                <div className="checks">
                  {/* ★追加：駐車場 */}
                  <label className="check-label" style={{background:'#e8f5e9', border:'1px solid #c8e6c9'}}>
                    <input type="checkbox" name="parking" checked={formData.conditions.parking} onChange={handleChange} />
                    <DirectionsCarIcon fontSize="small" color="success" /> 駐車場あり
                  </label>

                  <label className="check-label"><input type="checkbox" name="wheelchair" checked={formData.conditions.wheelchair} onChange={handleChange} /> ♿ 車椅子</label>
                  <label className="check-label"><input type="checkbox" name="diaper" checked={formData.conditions.diaper} onChange={handleChange} /> 👶 オムツ</label>
                  <label className="check-label"><input type="checkbox" name="open24h" checked={formData.conditions.open24h} onChange={handleChange} /> 🕒 24時間</label>
                  <label className="check-label"><input type="checkbox" name="ostomate" checked={formData.conditions.ostomate} onChange={handleChange} /> ➕ オストメイト</label>
                  <label className="check-label"><input type="checkbox" name="nursing_room" checked={formData.conditions.nursing_room} onChange={handleChange} /> 🍼 授乳室</label>
                  <label className="check-label"><input type="checkbox" name="washlet" checked={formData.conditions.washlet} onChange={handleChange} /> 🚽 ウォシュレット</label>
                  <label className="check-label"><input type="checkbox" name="gender_separated" checked={formData.conditions.gender_separated} onChange={handleChange} /> 🚻 男女別</label>
                  <label className="check-label"><input type="checkbox" name="free" checked={formData.conditions.free} onChange={handleChange} /> 💰 無料</label>
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">説明・メモ</label>
                <textarea name="description" className="textarea" rows="3" placeholder="例：改札を出て右側にあります。" value={formData.description} onChange={handleChange}></textarea>
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