// toilet-frontend/src/utils.js
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

// Cloudinaryへの画像アップロード関数
export async function uploadToCloudinary(file) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinaryの設定（Cloud Name または Upload Preset）が .env に見つかりません。");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "画像のアップロードに失敗しました");
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * フロントエンドのconditionsキー → バックエンドのEnum名 マッピング
 * ★追加: baby_chair → BABY_CHAIR
 *
 * 新しい設備を追加するときはここだけ編集すればよい。
 */
const CONDITION_MAP = {
  wheelchair:       'WHEELCHAIR',
  diaper:           'DIAPER',
  open24h:          'OPEN_24H',
  ostomate:         'OSTOMATE',
  nursing_room:     'NURSING_ROOM',
  baby_chair:       'BABY_CHAIR',
  washlet:          'WASHLET',
  gender_separated: 'GENDER_SEPARATED',
  free:             'FREE',
  parking:          'PARKING',
};

// conditions オブジェクト → Enum名の配列 (POST/PUT送信用)
export function buildEquipmentArray(conditions) {
  return Object.keys(conditions)
    .filter(key => conditions[key])
    .map(key => {
      const enumName = CONDITION_MAP[key];
      if (!enumName) {
        console.warn(`[buildEquipmentArray] CONDITION_MAPに未登録のキー: "${key}"`);
        return null;
      }
      return enumName;
    })
    .filter(Boolean);
}

/**
 * トイレオブジェクトから設備情報の Set を生成する (正規化)
 *
 * 以下の2パターンを統一して扱う:
 *   1. 新形式: equipment が文字列配列  ["WHEELCHAIR", "OPEN_24H"]
 *   2. 旧形式: equipment が CSV文字列  "wheelchair,open_24h"
 *
 * ※ パターン3（toilet.wheelchair 等のbooleanフラグ）はV7マイグレーション適用後に廃止済み
 *
 * @param {Object} toilet - APIレスポンスまたはローカルストレージのトイレオブジェクト
 * @returns {Set<string>} 大文字の設備名セット (例: Set{"WHEELCHAIR", "OPEN_24H"})
 */
export function normalizeEquipment(toilet) {
  const eqSet = new Set();

  // 1. 配列形式 (新形式)
  if (Array.isArray(toilet.equipment)) {
    toilet.equipment.forEach(e => eqSet.add(e.toUpperCase()));
  // 2. CSV文字列形式 (旧形式)
  } else if (typeof toilet.equipment === 'string' && toilet.equipment.length > 0) {
    toilet.equipment.split(',').forEach(e => eqSet.add(e.trim().toUpperCase()));
  }

  return eqSet;
}