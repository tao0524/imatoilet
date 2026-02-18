export const STORAGE_KEY = "imatoilet_user_toilets_v1";

// ユーザー登録データを読み込む
export function loadUserToilets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// ユーザー登録データを保存する
export function saveUserToilets(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

// ID生成
export function makeId() {
  return "u_" + Date.now() + "_" + Math.random().toString(16).slice(2, 8);
}

// 現在日付 (YYYY-MM-DD)
export function nowISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 2点間の距離計算 (Haversine formula)
export function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ★追加: Cloudinaryへの画像アップロード関数
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinaryの設定（Cloud Name または Upload Preset）が .env に見つかりません。");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // Cloudinaryへ送信
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "画像のアップロードに失敗しました");
  }

  const data = await res.json();
  return data.secure_url; // httpsから始まるURLを返す
}

/**
 * conditions オブジェクトから equipment CSV 文字列を生成する
 * フロントのキー名とバックエンドのCSV値の不一致を吸収する
 */
const CONDITION_TO_CSV = {
  wheelchair: 'wheelchair',
  diaper: 'diaper',
  open24h: 'open_24h',       // ★ フロント open24h → バックエンド open_24h
  ostomate: 'ostomate',
  nursing_room: 'nursing_room',
  washlet: 'washlet',
  gender_separated: 'gender_separated',
  free: 'free',
  parking: 'parking',
};

export function buildEquipmentCsv(conditions) {
  return Object.keys(conditions)
    .filter(key => conditions[key])
    .map(key => CONDITION_TO_CSV[key] || key)
    .join(',');
}