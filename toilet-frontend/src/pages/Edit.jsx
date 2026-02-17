import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadUserToilets, saveUserToilets } from '../utils';
import { API_BASE_URL } from '../config/api';
import './Register.css';
import ToiletForm from '../components/ToiletForm';
import EditIcon from '@mui/icons-material/Edit';

function Edit() {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // --- データ読み込み ---
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
      } else {
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
    const imageList = data.image ? data.image.split(',').filter(url => url.trim() !== "") : [];

    setFormData({
      name: data.name || '',
      address: data.address || '',
      description: data.description || '',
      lat: data.lat,
      lng: data.lng,
      images: imageList,
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

  // --- 送信処理 ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirm("この内容で更新しますか？")) return;
    setSubmitting(true);

    const equipmentList = Object.keys(formData.conditions).filter(key => formData.conditions[key]);
    const payload = {
      name: formData.name,
      address: formData.address,
      description: formData.description,
      lat: formData.lat,
      lng: formData.lng,
      cleanliness: formData.cleanliness,
      image: formData.images.join(','),
      facilityCategory: formData.facilityCategory,
      equipment: equipmentList.join(','),
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