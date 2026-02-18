import { useState, useEffect, useRef, useCallback } from 'react';
import { uploadToCloudinary } from '../utils';
import { SafeGoogleMap } from './SafeGoogleMap';

// アイコン
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ChairIcon from '@mui/icons-material/Chair'; // ★ベビーチェア用アイコン追加

// 施設タイプの選択肢
const FACILITY_OPTIONS = [
  { val: 'station',       label: '駅・交通' },
  { val: 'commercial',    label: '商業施設' },
  { val: 'convenience',   label: 'コンビニ・店' },
  { val: 'park',          label: '公園・屋外' },
  { val: 'public',        label: '公共施設' },
  { val: 'medical',       label: '医療・福祉' },
  { val: 'hotel_tourism', label: '観光・宿泊' },
  { val: 'other',         label: 'その他' }
];

// ドラッグ可能なAdvancedMarkerElement
const DraggableMarker = ({ map, position, onDragEnd }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    const pinElement = document.createElement('div');
    Object.assign(pinElement.style, {
      width: '24px', height: '24px',
      backgroundColor: '#2196F3',
      border: '3px solid white',
      borderRadius: '50%',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      cursor: 'grab'
    });

    const marker = new window.google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      content: pinElement,
      gmpDraggable: true,
      title: 'ドラッグして位置を調整'
    });

    const listener = marker.addListener('dragend', () => {
      if (onDragEnd && marker.position) {
        const lat = typeof marker.position.lat === 'function' ? marker.position.lat() : marker.position.lat;
        const lng = typeof marker.position.lng === 'function' ? marker.position.lng() : marker.position.lng;
        onDragEnd({ lat, lng });
      }
    });

    markerRef.current = marker;

    return () => {
      if (markerRef.current) markerRef.current.map = null;
      if (listener) window.google.maps.event.removeListener(listener);
    };
  }, [map]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.position = position;
    }
  }, [position.lat, position.lng]);

  return null;
};

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
  const [map, setMap] = useState(null);

  const onMapLoad = useCallback((mapInstance) => { setMap(mapInstance); }, []);

  const handleMapClick = (e) => {
    if (e.latLng) {
      setFormData(prev => ({ ...prev, lat: e.latLng.lat(), lng: e.latLng.lng() }));
    }
  };

  const handleMarkerDragEnd = (newPos) => {
    setFormData(prev => ({ ...prev, lat: newPos.lat, lng: newPos.lng }));
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
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map(file => uploadToCloudinary(file)));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    } catch (err) {
      console.error(err);
      alert('画像のアップロードに失敗しました。\n' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, cleanliness: rating }));
  };

  return (
    <main className="register-page">
      <div className="container">

        <div style={{ marginBottom: '20px' }}>
          <a
            href={backLink}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#666', textDecoration: 'none' }}
            onClick={(e) => { e.preventDefault(); window.history.length > 2 ? window.history.back() : (window.location.href = backLink); }}
          >
            <ArrowBackIcon fontSize="small" /> {backLabel}
          </a>
          <h1 style={{ marginTop: '10px', fontSize: '1.5rem' }}>{title}</h1>
        </div>

        <form className="register-grid" onSubmit={onSubmit}>

          {/* マップセクション */}
          <section className="panel panel--map">
            <div className="panel__head panel__head--tight">
              <h2 className="panel__title panel__title--small">
                {mapTitle} {mode === 'create' && <span className="req">必須</span>}
              </h2>
              <p className="panel__sub">{mapSub}</p>
            </div>

            <div className="reg-map-area">
              <SafeGoogleMap
                center={formData.lat ? { lat: formData.lat, lng: formData.lng } : { lat: 36.0825, lng: 140.1120 }}
                zoom={mode === 'create' ? 14 : 15}
                style={{ width: '100%', height: '100%' }}
                onClick={handleMapClick}
                onLoad={onMapLoad}
              >
                {formData.lat && formData.lng && (
                  <DraggableMarker
                    map={map}
                    position={{ lat: formData.lat, lng: formData.lng }}
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

          {/* 情報入力セクション */}
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">{mode === 'create' ? '2. トイレの情報' : '情報の修正'}</h2>
            </div>

            <div className="panel__body">

              {/* 名前 */}
              <div className="form-row">
                <label className="form-label">名前 <span className="req">必須</span></label>
                <input
                  type="text" name="name" className="input"
                  placeholder={mode === 'create' ? '例：つくば駅前公衆トイレ' : ''}
                  value={formData.name} onChange={handleChange} required
                />
              </div>

              {/* 住所 */}
              <div className="form-row">
                <label className="form-label">住所</label>
                <input
                  type="text" name="address" className="input"
                  placeholder={mode === 'create' ? '例：茨城県つくば市吾妻1-1' : ''}
                  value={formData.address} onChange={handleChange}
                />
              </div>

              {/* 写真 */}
              <div className="form-row">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AddPhotoAlternateIcon fontSize="small" sx={{ color: '#666' }} />
                  写真 <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#888' }}>（任意・複数可）</span>
                </label>

                <div style={{ marginBottom: '12px' }}>
                  <label
                    className={`btn btn-sub ${uploading ? 'btn-disabled' : ''}`}
                    style={{ display: 'inline-flex', width: 'auto', padding: '8px 16px', fontSize: '0.9rem', cursor: uploading ? 'wait' : 'pointer', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {uploading ? 'アップロード中...' : (
                      <><CloudUploadIcon fontSize="small" sx={{ mr: 1 }} /> 画像を選択（複数OK）</>
                    )}
                    <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} style={{ display: 'none' }} />
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '8px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9', minHeight: '120px', alignItems: 'center' }}>
                    {formData.images.map((url, index) => (
                      <div key={index} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={url} alt={`プレビュー ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #ddd', background: '#fff' }} />
                        <button
                          type="button" onClick={() => handleRemoveImage(index)}
                          style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff5252', color: 'white', border: '2px solid #fff', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
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
                      {star <= formData.cleanliness
                        ? <StarIcon sx={{ color: '#ffb400', fontSize: 32 }} />
                        : <StarBorderIcon sx={{ color: '#ccc', fontSize: 32 }} />
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* 施設タイプ */}
              <div className="form-row">
                <label className="form-label">施設タイプ <span className="req">必須</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                  {FACILITY_OPTIONS.map(opt => (
                    <label key={opt.val} className="check-label" style={{ fontWeight: 'normal' }}>
                      <input
                        type="radio" name="facilityCategory" value={opt.val}
                        checked={formData.facilityCategory === opt.val}
                        onChange={handleChange} required
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
                  <label className="check-label" style={{ background: '#e8f5e9', border: '1px solid #c8e6c9' }}>
                    <input type="checkbox" name="parking" checked={formData.conditions.parking} onChange={handleChange} />
                    <DirectionsCarIcon fontSize="small" color="success" /> 駐車場あり
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="wheelchair" checked={formData.conditions.wheelchair} onChange={handleChange} />
                    ♿ 車椅子
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="diaper" checked={formData.conditions.diaper} onChange={handleChange} />
                    👶 オムツ
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="open24h" checked={formData.conditions.open24h} onChange={handleChange} />
                    🕒 24時間
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="ostomate" checked={formData.conditions.ostomate} onChange={handleChange} />
                    ➕ オストメイト
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="nursing_room" checked={formData.conditions.nursing_room} onChange={handleChange} />
                    🍼 授乳室
                  </label>
                  {/* ★追加: ベビーチェア */}
                  <label className="check-label">
                    <input type="checkbox" name="baby_chair" checked={formData.conditions.baby_chair} onChange={handleChange} />
                    <ChairIcon fontSize="small" /> ベビーチェア
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="washlet" checked={formData.conditions.washlet} onChange={handleChange} />
                    🚽 ウォシュレット
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="gender_separated" checked={formData.conditions.gender_separated} onChange={handleChange} />
                    🚻 男女別
                  </label>
                  <label className="check-label">
                    <input type="checkbox" name="free" checked={formData.conditions.free} onChange={handleChange} />
                    💰 無料
                  </label>
                </div>
              </div>

              {/* 説明 */}
              <div className="form-row">
                <label className="form-label">説明・メモ</label>
                <textarea
                  name="description" className="textarea" rows="3"
                  placeholder={mode === 'create' ? '例：改札を出て右側にあります。' : ''}
                  value={formData.description} onChange={handleChange}
                />
              </div>

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