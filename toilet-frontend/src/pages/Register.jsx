import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import { API_BASE_URL } from '../config/api';
import { buildEquipmentArray } from '../utils';
import ToiletForm from '../components/ToiletForm';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';

function Register() {
  const navigate = useNavigate();

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
      baby_chair:       false, // ★追加
      washlet:          false,
      gender_separated: false,
      free:             false,
      parking:          false,
    }
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.lat || !formData.lng) {
      alert('地図をタップして、場所（ピン）を指定してください！');
      return;
    }

    if (!confirm('この内容で登録しますか？')) return;

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
      // 後方互換フラグ
      wheelchair:       formData.conditions.wheelchair,
      diaper:           formData.conditions.diaper,
      open24h:          formData.conditions.open24h,
    };

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('登録しました！');
        navigate('/search');
      } else if (res.status === 400) {
        try {
          const errData = await res.json();
          const msgs = errData.errors
            ? Object.values(errData.errors).join('\n')
            : errData.message || '入力内容に誤りがあります';
          alert('入力エラー:\n' + msgs);
        } catch {
          alert('入力内容に誤りがあります。');
        }
      } else {
        alert('登録に失敗しました。サーバーエラーです。');
      }
    } catch (err) {
      console.error(err);
      alert('通信エラーが発生しました。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ToiletForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      uploading={uploading}
      setUploading={setUploading}
      submitting={submitting}
      mode="create"
      backLink="/"
      backLabel="トップに戻る"
      title="トイレを登録する"
      submitLabel="登録する"
      submitIcon={<AddLocationAltIcon sx={{ mr: 1 }} />}
      mapTitle="1. 場所を指定"
      mapSub="地図をタップしてピンを立ててください"
    />
  );
}

export default Register;