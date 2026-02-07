import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { loadUserToilets, saveUserToilets, uploadToCloudinary } from '../utils';
import { API_BASE_URL } from '../config/api';
import './Register.css'; 

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // フォームの状態
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

  // --- 1. データ読み込み ---
  useEffect(() => {
    async function fetchData() {
      if (id.startsWith('u_')) {
        const userToilets = loadUserToilets();
        const found = userToilets.find(t => t.id === id);
        if (found) applyDataToForm(found);
        else {
            alert("データが見つかりません");
            setLoading(false);
        }
      } 
      else {
        try {
          const res = await fetch(`${API_BASE_URL}/${id}`);
          if (res.ok) {
            const data = await res.json();
            applyDataToForm(data);
          } else {
            alert("データの取得に失敗しました");
            navigate('/search');
          }
        } catch (err) {
          console.error(err);
          alert("通信エラーが発生しました");
        }
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyDataToForm = (data) => {
    const eqList = data.equipment ? data.equipment.split(',') : [];
    
    setFormData({
      name: data.name || '',
      address: data.address || '',
      description: data.description || '',
      lat: data.lat,
      lng: data.lng,
      image: data.image || '', 
      cleanliness: data.cleanliness || 3,
      facilityCategory: data.facilityCategory || '',
      conditions: {
        wheelchair: data.wheelchair || eqList.includes('wheelchair') || eqList.includes('WHEELCHAIR'),
        diaper: data.diaper || eqList.includes('diaper') || eqList.includes('DIAPER'),
        open24h: data.open24h || eqList.includes('open_24h') || eqList.includes('OPEN_24H'),
        ostomate: eqList.includes('ostomate') || eqList.includes('OSTOMATE'),
        nursing_room: eqList.includes('nursing_room') || eqList.includes('NURSING_ROOM'),
        washlet: eqList.includes('washlet') || eqList.includes('WASHLET'),
        gender_separated: eqList.includes('gender_separated') || eqList.includes('GENDER_SEPARATED'),
        free: eqList.includes('free') || eqList.includes('FREE'),
        parking: eqList.includes('parking') || eqList.includes('PARKING'),
      }
    });

    setLoading(false);
  };

  // --- 2. 地図の初期化 ---
  useEffect(() => {
    if (!loading && formData.lat && formData.lng) {
       initMap(formData.lat, formData.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const initMap = (lat, lng) => {
    if (!window.L) return;
    
    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }

    const map = window.L.map('edit-map').setView([lat, lng], 15);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    
    const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;
    mapRef.current = map;

    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
    });
    
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm("この内容で更新しますか？")) return;
    setSubmitting(true);

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
        if (id.startsWith('u_')) {
            const userToilets = loadUserToilets();
            const index = userToilets.findIndex(t => t.id === id);
            if (index !== -1) {
                userToilets[index] = { ...userToilets[index], ...payload, updatedAt: new Date().toISOString() };
                saveUserToilets(userToilets);
                alert("更新しました（ローカル）");
                navigate(`/detail/${id}`);
            }
        } else {
            const res = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("更新しました！");
                navigate(`/detail/${id}`);
            } else {
                alert("更新に失敗しました。");
            }
        }
    } catch (err) {
        console.error(err);
        alert("エラーが発生しました。");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{padding:'20px'}}>データを読み込んでいます...</div>;

  return (
    <main className="register-page">
      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <Link to={`/detail/${id}`} style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#666', textDecoration:'none' }}>
            <ArrowBackIcon fontSize="small" /> 詳細に戻る
          </Link>
          <h1 style={{ marginTop:'10px', fontSize:'1.5rem' }}>トイレ情報を編集</h1>
        </div>

        <form className="register-grid" onSubmit={handleSubmit}>
          <section className="panel panel--map">
            <div className="panel__head panel__head--tight">
              <h2 className="panel__title panel__title--small">場所の修正</h2>
              <p className="panel__sub">ピンをドラッグして位置を微調整できます</p>
            </div>
            <div id="edit-map" className="reg-map-area"></div>
            <div className="map-hint">
              <span className="dot"></span>
              <span>選択中: {Number(formData.lat).toFixed(5)}, {Number(formData.lng).toFixed(5)}</span>
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">情報の修正</h2>
            </div>
            <div className="panel__body">
              <div className="form-row">
                <label className="form-label">名前 <span className="req">必須</span></label>
                <input type="text" name="name" className="input" value={formData.name} onChange={handleChange} required />
              </div>

              {/* ★復活：住所入力欄 */}
              <div className="form-row">
                <label className="form-label">住所</label>
                <input type="text" name="address" className="input" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-row">
                <label className="form-label" style={{display:'flex', alignItems:'center', gap:'4px'}}>
                   <AddPhotoAlternateIcon fontSize="small" sx={{color:'#666'}}/> 写真
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
                        <CloudUploadIcon fontSize="small" sx={{ mr: 1 }} /> 画像を上書きアップロード
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
                  placeholder="https://example.com/photo.jpg" 
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
                <label className="form-label">清潔度</label>
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
                      <input type="radio" name="facilityCategory" value={opt.val} checked={formData.facilityCategory === opt.val} onChange={handleChange} required />
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
                <textarea name="description" className="textarea" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="form-footer">
                <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                  <EditIcon sx={{ mr: 1 }} />
                  {submitting ? '更新中...' : '更新内容を保存'}
                </button>
              </div>
            </div>
          </section>
        </form>
      </div>
    </main>
  );
}

export default Edit;