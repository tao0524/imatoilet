import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; 
import { API_BASE_URL } from '../config/api';
import { uploadToCloudinary } from '../utils';

// ★Google Maps用コンポーネント
import { Marker } from '@react-google-maps/api';
import { SafeGoogleMap } from '../components/SafeGoogleMap';

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Register() {
  const navigate = useNavigate();

  // --- フォームの状態管理 ---
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    lat: '',
    lng: '',
    image: '', 
    cleanliness: 3, 
    facilityCategory: '', 
    conditions: {
      wheelchair: false,
      diaper: false,
      open24h: false,
      ostomate: false,
      nursing_room: false,
      washlet: false,
      gender_separated: false,
      free: false,
      parking: false
    }
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ★Google Maps: 地図をクリックした時の処理
  const handleMapClick = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData(prev => ({ ...prev, lat, lng }));
    }
  };

  // ★Google Maps: ピンをドラッグした時の処理
  const handleMarkerDragEnd = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData(prev => ({ ...prev, lat, lng }));
    }
  };

  // 3. 入力変更ハンドラ
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    if (name in formData.conditions) {
      setFormData(prev => ({
        ...prev,
        conditions: { ...prev.conditions, [name]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // 画像アップロードハンドラ
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, image: uploadedUrl }));
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに失敗しました。\n" + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, cleanliness: rating }));
  };

  // 4. 送信処理
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      alert("地図をタップして、場所（ピン）を指定してください！");
      return;
    }

    if (!confirm("この内容で登録しますか？")) return;

    setLoading(true);

    const equipmentList = Object.keys(formData.conditions).filter(key => formData.conditions[key]);
    const equipmentStr = equipmentList.join(',');

    const payload = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      lat: formData.lat,
      lng: formData.lng,
      cleanliness: formData.cleanliness,
      image: formData.image,
      facilityCategory: formData.facilityCategory,
      equipment: equipmentStr,
      wheelchair: formData.conditions.wheelchair,
      diaper: formData.conditions.diaper,
      open24h: formData.conditions.open24h
    };

    try {
      const res = await fetch(API_BASE_URL, {
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
          
          <section className="panel panel--map">
            <div className="panel__head panel__head--tight">
              <h2 className="panel__title panel__title--small">1. 場所を指定 <span className="req">必須</span></h2>
              <p className="panel__sub">地図をタップしてピンを立ててください</p>
            </div>
            
            {/* ★Google Maps 表示エリア */}
            <div className="reg-map-area">
              <SafeGoogleMap
                center={formData.lat ? { lat: formData.lat, lng: formData.lng } : { lat: 36.0825, lng: 140.1120 }}
                zoom={14}
                style={{ width: '100%', height: '100%' }}
                onClick={handleMapClick} // 地図クリックでピン移動
              >
                {formData.lat && formData.lng && (
                  <Marker
                    position={{ lat: formData.lat, lng: formData.lng }}
                    draggable={true} // ドラッグ可能にする
                    onDragEnd={handleMarkerDragEnd} // ドラッグ終了時に座標更新
                  />
                )}
              </SafeGoogleMap>
            </div>

            <div className="map-hint">
              <span className="dot"></span>
              {formData.lat ? (
                <span>選択中: {Number(formData.lat).toFixed(5)}, {Number(formData.lng).toFixed(5)}</span>
              ) : (
                <span>地図をタップしてください</span>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">2. トイレの情報</h2>
            </div>

            <div className="panel__body">
              <div className="form-row">
                <label className="form-label">名前 <span className="req">必須</span></label>
                <input type="text" name="name" className="input" placeholder="例：つくば駅前公衆トイレ" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="form-row">
                <label className="form-label">住所</label>
                <input type="text" name="address" className="input" placeholder="例：茨城県つくば市吾妻1-1" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-row">
                <label className="form-label" style={{display:'flex', alignItems:'center', gap:'4px'}}>
                   <AddPhotoAlternateIcon fontSize="small" sx={{color:'#666'}}/> 写真 <span style={{fontSize:'0.7rem', fontWeight:'normal', color:'#888'}}>（任意）</span>
                </label>
                
                <div style={{ marginBottom: '8px' }}>
                  <label 
                    className={`btn btn-sub ${uploading ? 'btn-disabled' : ''}`} 
                    style={{ 
                      display: 'inline-flex', 
                      width: 'auto', 
                      padding: '8px 16px', 
                      fontSize: '0.9rem',
                      cursor: uploading ? 'wait' : 'pointer',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {uploading ? 'アップロード中...' : (
                      <>
                        <CloudUploadIcon fontSize="small" sx={{ mr: 1 }} /> 画像を選択してアップロード
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      disabled={uploading}
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                <input 
                  type="url" 
                  name="image" 
                  className="input" 
                  placeholder="https://... (自動入力されます)" 
                  value={formData.image} 
                  onChange={handleChange} 
                />

                {formData.image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}>プレビュー:</p>
                    <img 
                      src={formData.image} 
                      alt="プレビュー" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                      onError={(e) => e.target.style.display = 'none'} 
                    />
                  </div>
                )}
              </div>

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
                <button type="submit" className="btn btn-primary" disabled={loading || uploading}>
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