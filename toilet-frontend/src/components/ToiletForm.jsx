import { uploadToCloudinary } from '../utils';
import { Marker } from '@react-google-maps/api';
import { SafeGoogleMap } from './SafeGoogleMap';

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

// 施設タイプの選択肢
const FACILITY_OPTIONS = [
  { val: 'station', label: '駅・交通' },
  { val: 'commercial', label: '商業施設' },
  { val: 'convenience', label: 'コンビニ・店' },
  { val: 'park', label: '公園・屋外' },
  { val: 'public', label: '公共施設' },
  { val: 'medical', label: '医療・福祉' },
  { val: 'hotel_tourism', label: '観光・宿泊' },
  { val: 'other', label: 'その他' }
];

/**
 * トイレ登録・編集の共通フォームコンポーネント
 *
 * @param {object}   formData       - フォームの状態
 * @param {function} setFormData    - フォームの状態更新関数
 * @param {function} onSubmit       - 送信処理（親コンポーネントで定義）
 * @param {boolean}  uploading      - 画像アップロード中フラグ
 * @param {function} setUploading   - アップロード中フラグの更新関数
 * @param {boolean}  submitting     - 送信中フラグ
 * @param {string}   mode           - 'create' | 'edit'
 * @param {string}   backLink       - 戻るリンクのパス
 * @param {string}   backLabel      - 戻るリンクのテキスト
 * @param {string}   title          - ページタイトル
 * @param {string}   submitLabel    - 送信ボタンのテキスト
 * @param {React.ReactNode} submitIcon - 送信ボタンのアイコン
 * @param {string}   mapTitle       - 地図セクションのタイトル
 * @param {string}   mapSub         - 地図セクションのサブテキスト
 */
export default function ToiletForm({
  formData,
  setFormData,
  onSubmit,
  uploading,
  setUploading,
  submitting,
  mode,
  backLink,
  backLabel,
  title,
  submitLabel,
  submitIcon,
  mapTitle,
  mapSub,
}) {
  // --- 地図操作 ---
  const handleMapClick = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData(prev => ({ ...prev, lat, lng }));
    }
  };

  const handleMarkerDragEnd = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setFormData(prev => ({ ...prev, lat, lng }));
    }
  };

  // --- 入力変更 ---
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

  // --- 画像アップロード ---
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      console.error(err);
      alert("画像のアップロードに失敗しました。\n" + err.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 画像削除 ---
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- 星評価 ---
  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, cleanliness: rating }));
  };

  return (
    <main className="register-page">
      <div className="container">

        <div style={{ marginBottom: '20px' }}>
          <a href={backLink} style={{ display:'inline-flex', alignItems:'center', gap:'4px', color:'#666', textDecoration:'none' }}
             onClick={(e) => { e.preventDefault(); window.history.length > 2 ? window.history.back() : (window.location.href = backLink); }}>
            <ArrowBackIcon fontSize="small" /> {backLabel}
          </a>
          <h1 style={{ marginTop:'10px', fontSize:'1.5rem' }}>{title}</h1>
        </div>

        <form className="register-grid" onSubmit={onSubmit}>

          {/* === 地図セクション === */}
          <section className="panel panel--map">
            <div className="panel__head panel__head--tight">
              <h2 className="panel__title panel__title--small">{mapTitle} {mode === 'create' && <span className="req">必須</span>}</h2>
              <p className="panel__sub">{mapSub}</p>
            </div>

            <div className="reg-map-area">
              <SafeGoogleMap
                center={formData.lat ? { lat: formData.lat, lng: formData.lng } : { lat: 36.0825, lng: 140.1120 }}
                zoom={mode === 'create' ? 14 : 15}
                style={{ width: '100%', height: '100%' }}
                onClick={handleMapClick}
              >
                {formData.lat && formData.lng && (
                  <Marker
                    position={{ lat: formData.lat, lng: formData.lng }}
                    draggable={true}
                    onDragEnd={handleMarkerDragEnd}
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

          {/* === 情報入力セクション === */}
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">{mode === 'create' ? '2. トイレの情報' : '情報の修正'}</h2>
            </div>

            <div className="panel__body">
              {/* 名前 */}
              <div className="form-row">
                <label className="form-label">名前 <span className="req">必須</span></label>
                <input type="text" name="name" className="input"
                  placeholder={mode === 'create' ? '例：つくば駅前公衆トイレ' : ''}
                  value={formData.name} onChange={handleChange} required />
              </div>

              {/* 住所 */}
              <div className="form-row">
                <label className="form-label">住所</label>
                <input type="text" name="address" className="input"
                  placeholder={mode === 'create' ? '例：茨城県つくば市吾妻1-1' : ''}
                  value={formData.address} onChange={handleChange} />
              </div>

              {/* 写真 */}
              <div className="form-row">
                <label className="form-label" style={{display:'flex', alignItems:'center', gap:'4px'}}>
                  <AddPhotoAlternateIcon fontSize="small" sx={{color:'#666'}}/> 写真 <span style={{fontSize:'0.7rem', fontWeight:'normal', color:'#888'}}>（任意・複数可）</span>
                </label>

                <div style={{ marginBottom: '12px' }}>
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
                        <CloudUploadIcon fontSize="small" sx={{ mr: 1 }} /> 画像を選択（複数OK）
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    padding: '8px',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    background: '#f9f9f9',
                    minHeight: '120px',
                    alignItems: 'center'
                  }}>
                    {formData.images.map((url, index) => (
                      <div key={index} style={{ position: 'relative', flexShrink: 0 }}>
                        <img
                          src={url}
                          alt={`プレビュー ${index + 1}`}
                          style={{
                            width: '100px',
                            height: '100px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            background: '#fff'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ff5252',
                            color: 'white',
                            border: '2px solid #fff',
                            borderRadius: '50%',
                            width: '26px',
                            height: '26px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                          title="この画像を削除"
                        >
                          <DeleteIcon style={{ fontSize: '16px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 清潔度 */}
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
              </div>

              {/* 施設タイプ */}
              <div className="form-row">
                <label className="form-label">施設タイプ <span className="req">必須</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop:'8px' }}>
                  {FACILITY_OPTIONS.map(opt => (
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

              {/* 設備・特徴 */}
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

              {/* 説明 */}
              <div className="form-row">
                <label className="form-label">説明・メモ</label>
                <textarea name="description" className="textarea" rows="3"
                  placeholder={mode === 'create' ? '例：改札を出て右側にあります。' : ''}
                  value={formData.description} onChange={handleChange}></textarea>
              </div>

              {/* 送信ボタン */}
              <div className="form-footer">
                <button type="submit" className="btn btn-primary" disabled={submitting || uploading}>
                  {submitIcon}
                  {submitting ? (mode === 'create' ? '送信中...' : '更新中...') : submitLabel}
                </button>
              </div>
            </div>
          </section>

        </form>
      </div>
    </main>
  );
}