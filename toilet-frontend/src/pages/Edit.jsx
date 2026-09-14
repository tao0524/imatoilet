import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadUserToilets, saveUserToilets, buildEquipmentArray, normalizeEquipment } from '../utils';
import './Register.css';
import ToiletForm from '../components/ToiletForm';
import EditIcon from '@mui/icons-material/Edit';

function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isLocalToilet = id.startsWith('u_');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    lat: '',
    lng: '',
    images: [],
    cleanliness: 3,
    facilityCategory: '',
    conditions: {
      wheelchair:       false,
      diaper:           false,
      open24h:          false,
      ostomate:         false,
      nursing_room:     false,
      baby_chair:       false,
      washlet:          false,
      gender_separated: false,
      free:             false,
      parking:          false,
    }
  });

  // --- データ読み込み ---
  useEffect(() => {
    async function fetchData() {
      if (!isLocalToilet) {
        setLoading(false);
        return;
      }

      const userToilets = loadUserToilets();
      const found = userToilets.find(t => t.id === id);
      if (found) applyDataToForm(found);
      else { alert('データが見つかりません'); setLoading(false); }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyDataToForm = (data) => {
    const eqSet = normalizeEquipment(data);

    const imageList = data.image
      ? data.image.split(',').filter(url => url.trim() !== '')
      : [];

    setFormData({
      name:             data.name || '',
      address:          data.address || '',
      description:      data.description || '',
      lat:              data.lat,
      lng:              data.lng,
      images:           imageList,
      cleanliness:      data.cleanliness || 3,
      facilityCategory: data.facilityCategory || '',
      conditions: {
        wheelchair:       eqSet.has('WHEELCHAIR'),
        diaper:           eqSet.has('DIAPER'),
        open24h:          eqSet.has('OPEN_24H'),
        ostomate:         eqSet.has('OSTOMATE'),
        nursing_room:     eqSet.has('NURSING_ROOM'),
        baby_chair:       eqSet.has('BABY_CHAIR'),
        washlet:          eqSet.has('WASHLET'),
        gender_separated: eqSet.has('GENDER_SEPARATED'),
        free:             eqSet.has('FREE'),
        parking:          eqSet.has('PARKING'),
      }
    });

    setLoading(false);
  };

  // --- 送信処理 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLocalToilet) return;
    if (!confirm('この内容で更新しますか？')) return;
    setSubmitting(true);

    const payload = {
      name:             formData.name,
      address:          formData.address,
      description:      formData.description,
      lat:              Number(formData.lat),
      lng:              Number(formData.lng),
      cleanliness:      Number(formData.cleanliness),
      image:            formData.images.join(','),
      facilityCategory: formData.facilityCategory,
      equipment:        buildEquipmentArray(formData.conditions),
    };

    try {
      const userToilets = loadUserToilets();
      const index = userToilets.findIndex(t => t.id === id);
      if (index !== -1) {
        userToilets[index] = { ...userToilets[index], ...payload, updatedAt: new Date().toISOString() };
        saveUserToilets(userToilets);
        alert('更新しました（ローカル）');
        navigate(`/detail/${id}`);
      }
    } catch (err) {
      console.error(err);
      alert('エラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '20px' }}>データを読み込んでいます...</div>;

  if (!isLocalToilet) return (
    <div className="container" style={{ padding: '20px' }}>
      <h1>このトイレは編集できません</h1>
      <p>このトイレは現在この画面から編集できません。</p>
      <button type="button" className="btn" onClick={() => navigate(`/detail/${id}`)}>
        詳細に戻る
      </button>
    </div>
  );

  return (
    <ToiletForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      uploading={uploading}
      setUploading={setUploading}
      submitting={submitting}
      mode="edit"
      backLink={`/detail/${id}`}
      backLabel="詳細に戻る"
      title="トイレ情報を編集"
      submitLabel="更新内容を保存"
      submitIcon={<EditIcon sx={{ mr: 1 }} />}
      mapTitle="場所の修正"
      mapSub="ピンをドラッグして位置を微調整できます"
    />
  );
}

export default Edit;
