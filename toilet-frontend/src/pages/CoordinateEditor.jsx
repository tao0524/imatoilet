import { useState, useMemo } from "react";
import { useJsApiLoader } from "@react-google-maps/api"; // ★追加: API読み込み用

const INITIAL_TOILETS = [
  // V4 サンプルデータ
  { id: "v4_1",  source: "V4", name: "つくば駅 多目的トイレ",         address: "茨城県つくば市吾妻2丁目",           lat: 36.0833, lng: 140.1120 },
  { id: "v4_2",  source: "V4", name: "つくば駅 北口公衆トイレ",       address: "茨城県つくば市吾妻1丁目",           lat: 36.0840, lng: 140.1125 },
  { id: "v4_3",  source: "V4", name: "研究学園駅 バリアフリートイレ", address: "茨城県つくば市研究学園5丁目",       lat: 36.0815, lng: 140.0820 },
  { id: "v4_4",  source: "V4", name: "BiViつくば 2Fトイレ",           address: "茨城県つくば市吾妻1-8-10",          lat: 36.0828, lng: 140.1115 },
  { id: "v4_5",  source: "V4", name: "イーアスつくば フードコート横", address: "茨城県つくば市研究学園5-19",        lat: 36.0860, lng: 140.0810 },
  { id: "v4_6",  source: "V4", name: "LALAガーデンつくば 東館",       address: "茨城県つくば市小野崎278-1",         lat: 36.0750, lng: 140.1050 },
  { id: "v4_7",  source: "V4", name: "つくば中央公園 トイレ",         address: "茨城県つくば市吾妻2-7-5",          lat: 36.0855, lng: 140.1130 },
  { id: "v4_8",  source: "V4", name: "洞峰公園 管理棟トイレ",         address: "茨城県つくば市二の宮2-20",          lat: 36.0580, lng: 140.1250 },
  { id: "v4_9",  source: "V4", name: "松見公園 公衆トイレ",           address: "茨城県つくば市天久保1-4",           lat: 36.0950, lng: 140.1100 },
  { id: "v4_10", source: "V4", name: "筑波メディカルセンター病院",     address: "茨城県つくば市天久保1-3-1",         lat: 36.0920, lng: 140.1110 },
  { id: "v4_11", source: "V4", name: "つくば市役所 本庁舎",           address: "茨城県つくば市研究学園1-1-1",       lat: 36.0780, lng: 140.0800 },
  { id: "v4_12", source: "V4", name: "ホテル日航つくば ロビー",       address: "茨城県つくば市吾妻1-1364-1",        lat: 36.0825, lng: 140.1135 },
  { id: "v4_13", source: "V4", name: "オークラフロンティア ホテル",   address: "茨城県つくば市吾妻1丁目",           lat: 36.0830, lng: 140.1140 },
  { id: "v4_14", source: "V4", name: "セブンイレブン つくば吾妻店",   address: "茨城県つくば市吾妻3丁目",           lat: 36.0880, lng: 140.1150 },
  { id: "v4_15", source: "V4", name: "ENEOS つくば学園SS",            address: "茨城県つくば市竹園1丁目",           lat: 36.0800, lng: 140.1180 },
  // V9 オープンデータ（V10修正適用済み）
  { id: "v9_1",  source: "V9", name: "ローソンつくば小茎店",                  address: "茨城県つくば市小茎294-1",                   lat: 36.0180, lng: 140.1347 },
  { id: "v9_2",  source: "V9", name: "ローソンつくば筑穂二丁目",              address: "茨城県つくば市筑穂2-2-5",                   lat: 36.0765, lng: 140.0674 },
  { id: "v9_3",  source: "V9", name: "ローソン新つくば妻木店",                address: "茨城県つくば市妻木216-1",                   lat: 36.0888, lng: 140.1087 },
  { id: "v9_4",  source: "V9", name: "ローソンつくば東新井店",                address: "茨城県つくば市東新井24-14",                 lat: 36.0829, lng: 140.1155 },
  { id: "v9_5",  source: "V9", name: "ホテルベストランド",                    address: "茨城県つくば市研究学園五丁目8番地4",        lat: 36.0812, lng: 140.0861 },
  { id: "v9_6",  source: "V9", name: "ホテルマークワンつくば研究学園",        address: "茨城県つくば市研究学園5丁目13番地5",        lat: 36.0776, lng: 140.0855 },
  { id: "v9_7",  source: "V9", name: "ホテルグランド東雲",                    address: "茨城県つくば市小野崎488-1",                 lat: 36.0721, lng: 140.1039 },
  { id: "v9_8",  source: "V9", name: "ヨークベニマル つくば竹園店",           address: "茨城県つくば市竹園１－３－１",              lat: 36.0790, lng: 140.1194 },
  { id: "v9_9",  source: "V9", name: "イーアスつくば",                        address: "茨城県つくば市研究学園5丁目19番地",         lat: 36.0781, lng: 140.0785 },
  { id: "v9_10", source: "V9", name: "つくばクレオスクエア",                  address: "茨城県つくば市吾妻1-6-1",                   lat: 36.0805, lng: 140.1093 },
  { id: "v9_11", source: "V9", name: "ＬＡＬＡガーデンつくば",               address: "茨城県つくば市小野崎字千駄苅278-1",        lat: 36.0785, lng: 140.1098 },
  { id: "v9_12", source: "V9", name: "とりせん研究学園店",                    address: "茨城県つくば市研究学園5-18-1",              lat: 36.0784, lng: 140.0783 },
  { id: "v9_13", source: "V9", name: "カスミ 筑波店",                         address: "茨城県つくば市北条内町裏５１４４",          lat: 36.2220, lng: 140.1976 },
  { id: "v9_14", source: "V9", name: "カスミ フードスクエア学園店",           address: "茨城県つくば市竹園２丁目１２－１",          lat: 36.0796, lng: 140.1179 },
  { id: "v9_15", source: "V9", name: "カスミ テクノパーク桜店",               address: "茨城県つくば市桜１丁目２２番地",           lat: 36.0451, lng: 140.0933 },
  { id: "v9_16", source: "V9", name: "カスミ みどりの駅前店",                 address: "茨城県つくば市みどりの１丁目３－１",        lat: 36.0357, lng: 140.0580 }, // V10修正済
  { id: "v9_17", source: "V9", name: "カスミ 万博記念公園駅前店",             address: "茨城県つくば市島名福田坪土地区画整理地48街区", lat: 36.0557, lng: 140.0305 },
  { id: "v9_18", source: "V9", name: "カスミ フードスクエア学園の森店",       address: "茨城県つくば市学園の森２丁目３４－４",      lat: 36.0811, lng: 140.0809 },
  { id: "v9_19", source: "V9", name: "カスミ 筑波大学店",                     address: "茨城県つくば市天久保３丁目１－１０",        lat: 36.0991, lng: 140.1074 },
  { id: "v9_20", source: "V9", name: "カスミ プルシェつくばキュート店",       address: "茨城県つくば市吾妻１－６－１",              lat: 36.0809, lng: 140.1109 },
  { id: "v9_21", source: "V9", name: "つくば駅",                              address: "茨城県つくば市吾妻2-128",                   lat: 36.0857, lng: 140.1114 },
  { id: "v9_22", source: "V9", name: "研究学園駅",                            address: "茨城県つくば市研究学園5-9-1",               lat: 36.0851, lng: 140.0787 },
  { id: "v9_23", source: "V9", name: "万博記念公園駅",                        address: "茨城県つくば市島名4386",                    lat: 36.0589, lng: 140.0367 },
  { id: "v9_24", source: "V9", name: "みどりの駅",                            address: "茨城県つくば市みどりの1-29-3",              lat: 36.0320, lng: 140.0519 }, // V10修正済
  { id: "v9_25", source: "V9", name: "北１駐車場",                            address: "茨城県つくば市吾妻2-4-6",                   lat: 36.0797, lng: 140.1081 },
  { id: "v9_26", source: "V9", name: "南２駐車場",                            address: "茨城県つくば市吾妻1-12-10",                 lat: 36.0877, lng: 140.1084 },
  { id: "v9_27", source: "V9", name: "南１駐車場",                            address: "茨城県つくば市吾妻1-5-1",                   lat: 36.0873, lng: 140.1120 },
  { id: "v9_28", source: "V9", name: "つくば文化会館アルス（中央図書館）",   address: "茨城県つくば市吾妻2-8",                    lat: 36.0807, lng: 140.1107 },
  { id: "v9_29", source: "V9", name: "つくば市役所",                          address: "茨城県つくば市研究学園1-1-1",               lat: 36.0745, lng: 140.0836 },
  { id: "v9_30", source: "V9", name: "大穂窓口センター",                      address: "茨城県つくば市筑穂1-10-4",                  lat: 36.0753, lng: 140.0625 },
  { id: "v9_31", source: "V9", name: "茎崎窓口センター",                      address: "茨城県つくば市小茎320",                     lat: 36.0167, lng: 140.1291 },
  { id: "v9_32", source: "V9", name: "谷田部保健センター",                    address: "茨城県つくば市谷田部4774-18",               lat: 36.0505, lng: 140.1278 },
  { id: "v9_33", source: "V9", name: "桜保健センター",                        address: "茨城県つくば市流星台61-1",                  lat: 36.0842, lng: 140.0917 },
  { id: "v9_34", source: "V9", name: "つくばカピオ",                          address: "茨城県つくば市竹園1-10-1",                  lat: 36.0799, lng: 140.1123 },
  { id: "v9_35", source: "V9", name: "市民ホールやたべ",                      address: "茨城県つくば市谷田部4711",                  lat: 36.0482, lng: 140.1260 },
  { id: "v9_36", source: "V9", name: "筑波交流センター",                      address: "茨城県つくば市北条5060",                    lat: 36.2184, lng: 140.2006 },
  { id: "v9_37", source: "V9", name: "松代交流センター",                      address: "茨城県つくば市松代4-16-3",                  lat: 36.0739, lng: 140.1208 },
  { id: "v9_38", source: "V9", name: "竹園交流センター",                      address: "茨城県つくば市竹園3-19-2",                  lat: 36.0752, lng: 140.1116 },
  { id: "v9_39", source: "V9", name: "二の宮交流センター",                    address: "茨城県つくば市二の宮4-6-2",                 lat: 36.0756, lng: 140.1196 },
  { id: "v9_40", source: "V9", name: "大穂交流センター",                      address: "茨城県つくば市筑穂1-10-4",                  lat: 36.0735, lng: 140.0633 },
  { id: "v9_41", source: "V9", name: "宝篋山小田休憩所",                      address: "茨城県つくば市小田4544",                    lat: 36.2076, lng: 140.1660 },
  { id: "v9_42", source: "V9", name: "筑波山梅林休憩所トイレ",                address: "茨城県つくば市沼田1435-56",                 lat: 36.2250, lng: 140.0992 },
  { id: "v9_43", source: "V9", name: "市営筑波山第1駐車場トイレ",             address: "茨城県つくば市沼田1698番地1",               lat: 36.2301, lng: 140.0976 },
  { id: "v9_44", source: "V9", name: "市営筑波山第2駐車場トイレ",             address: "茨城県つくば市筑波1222",                    lat: 36.2247, lng: 140.1014 },
  { id: "v9_45", source: "V9", name: "市営筑波山第3駐車場トイレ",             address: "茨城県つくば市筑波1108",                    lat: 36.2280, lng: 140.1034 },
  { id: "v9_46", source: "V9", name: "筑波山御幸が原トイレ(女体山側)",        address: "茨城県つくば市筑波1",                       lat: 36.2209, lng: 140.1086 },
  { id: "v9_47", source: "V9", name: "筑波山御幸が原トイレ(男体山側)",        address: "茨城県つくば市筑波1",                       lat: 36.2236, lng: 140.1085 },
  { id: "v9_48", source: "V9", name: "筑波山おもてなし館",                    address: "茨城県つくば市沼田1690-3",                  lat: 36.2331, lng: 140.1005 },
  { id: "v9_49", source: "V9", name: "筑波窓口センター",                      address: "茨城県つくば市北条5060",                    lat: 36.2243, lng: 140.1990 },
  { id: "v9_50", source: "V9", name: "研究学園駅前公園",                      address: "茨城県つくば市学園南2丁目1",                lat: 36.0839, lng: 140.0772 },
  { id: "v9_51", source: "V9", name: "つくば駅前広場",                        address: "茨城県つくば市吾妻1-121",                   lat: 36.0792, lng: 140.1110 },
  { id: "v9_52", source: "V9", name: "研究学園駅前広場",                      address: "茨城県つくば市研究学園5-111",               lat: 36.0830, lng: 140.0822 },
];

const SOURCE_COLORS = {
  V4: { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
  V9: { bg: "#f0fdf4", text: "#166534", border: "#86efac" },
};

const LIBRARIES = ['places', 'marker']; // ★追加

function validateCoord(val) {
  const n = parseFloat(val);
  return !isNaN(n) && isFinite(n);
}

export default function CoordinateEditor() {
  // ★追加: この画面専用にGoogle Maps APIを読み込む
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
    language: 'ja',
  });

  const [toilets, setToilets] = useState(() =>
    INITIAL_TOILETS.map(t => ({ ...t, editLat: String(t.lat), editLng: String(t.lng), changed: false }))
  );
  const [filter, setFilter] = useState("");
  const [showSQL, setShowSQL] = useState(false);
  const [copied, setCopied] = useState(false);

  const filtered = useMemo(() => {
    if (!filter.trim()) return toilets;
    const q = filter.toLowerCase();
    return toilets.filter(t => t.name.toLowerCase().includes(q) || t.address.toLowerCase().includes(q));
  }, [toilets, filter]);

  const changedCount = toilets.filter(t => t.changed).length;

  function handleField(id, field, value) {
    setToilets(prev => prev.map(t => {
      if (t.id !== id) return t;
      const updated = { ...t, [field]: value };
      const latOk = validateCoord(updated.editLat);
      const lngOk = validateCoord(updated.editLng);
      const latChanged = latOk && parseFloat(updated.editLat) !== t.lat;
      const lngChanged = lngOk && parseFloat(updated.editLng) !== t.lng;
      updated.changed = latChanged || lngChanged;
      return updated;
    }));
  }

  function openMaps(t) {
    const q = encodeURIComponent(t.name + " " + t.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  }

  function openCurrentCoord(t) {
    const lat = parseFloat(t.editLat);
    const lng = parseFloat(t.editLng);
    if (validateCoord(lat) && validateCoord(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  }

  function resetRow(id) {
    setToilets(prev => prev.map(t => {
      if (t.id !== id) return t;
      return { ...t, editLat: String(t.lat), editLng: String(t.lng), changed: false };
    }));
  }

  // ★修正: isLoadedのチェックを追加
  function autoGeocode(t) {
    if (!isLoaded || !window.google || !window.google.maps) {
      alert("Google Maps APIを読み込み中です。数秒待ってからもう一度お試しください。");
      return;
    }
    
    // 検索クエリ
    const query = t.address; 
    
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      if (status === "OK" && results[0]) {
        const newLat = results[0].geometry.location.lat().toFixed(6);
        const newLng = results[0].geometry.location.lng().toFixed(6);
        
        // 取得した座標を入力欄にセット
        handleField(t.id, "editLat", newLat);
        handleField(t.id, "editLng", newLng);
      } else {
        alert(`「${t.name}」の座標取得に失敗しました。\n手動でGoogleマップから確認してください。`);
      }
    });
  }

  const sqlText = useMemo(() => {
    const changed = toilets.filter(t => t.changed && validateCoord(t.editLat) && validateCoord(t.editLng));
    if (changed.length === 0) return "-- 変更がありません";
    const lines = [
      "-- V12__fix_coordinates.sql",
      "-- 座標修正マイグレーション (自動生成)",
      `-- 対象件数: ${changed.length}件`,
      "",
      "BEGIN;",
      "",
      ...changed.map(t =>
        `UPDATE toilet SET lat = ${parseFloat(t.editLat)}, lng = ${parseFloat(t.editLng)} WHERE name = '${t.name}';`
      ),
      "",
      "COMMIT;",
    ];
    return lines.join("\n");
  }, [toilets]);

  function copySQL() {
    navigator.clipboard.writeText(sqlText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ fontFamily: "'Noto Sans JP', 'Hiragino Sans', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "20px" }}>
      {/* ヘッダー */}
      <div style={{ background: "#fff", borderRadius: "12px", padding: "20px 24px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#1e293b" }}>📍 座標一括修正ツール</h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            全 <strong>{toilets.length}</strong> 件 ／ 修正済み：<strong style={{ color: changedCount > 0 ? "#16a34a" : "#94a3b8" }}>{changedCount} 件</strong>
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="施設名・住所で絞り込み"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.88rem", width: "200px", outline: "none" }}
          />
          <button
            onClick={() => setShowSQL(s => !s)}
            disabled={changedCount === 0}
            style={{
              padding: "8px 18px", borderRadius: "8px", fontSize: "0.88rem", fontWeight: 700, cursor: changedCount === 0 ? "not-allowed" : "pointer",
              background: changedCount > 0 ? "#0f172a" : "#e2e8f0", color: changedCount > 0 ? "#fff" : "#94a3b8", border: "none"
            }}
          >
            🗃 V12 SQL生成 ({changedCount}件)
          </button>
        </div>
      </div>

      {/* 使い方 */}
      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "0.83rem", color: "#92400e", lineHeight: 1.6 }}>
        <strong>🔍 使い方：</strong>
        「🤖 自動取得」ボタンで住所から座標をセット → 「現在座標」ボタンでピンが正しい場所に刺さっているか確認 → 全件修正完了後「V12 SQL生成」をクリック
      </div>

      {/* SQL出力 */}
      {showSQL && (
        <div style={{ background: "#0f172a", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px", position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#7dd3fc", fontSize: "0.85rem", fontWeight: 700 }}>📄 V12__fix_coordinates.sql</span>
            <button
              onClick={copySQL}
              style={{ padding: "5px 14px", background: copied ? "#16a34a" : "#334155", color: "#fff", border: "none", borderRadius: "6px", fontSize: "0.8rem", cursor: "pointer" }}
            >
              {copied ? "✅ コピー済み" : "📋 コピー"}
            </button>
          </div>
          <pre style={{ color: "#e2e8f0", fontSize: "0.8rem", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.7, maxHeight: "320px", overflowY: "auto" }}>
            {sqlText}
          </pre>
        </div>
      )}

      {/* テーブル */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {/* テーブルヘッダー */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 130px 130px 130px",
          padding: "10px 16px",
          background: "#f1f5f9",
          fontSize: "0.78rem",
          fontWeight: 700,
          color: "#475569",
          borderBottom: "1px solid #e2e8f0",
          gap: "8px",
        }}>
          <span>#</span>
          <span>施設名 / 住所</span>
          <span>緯度 (lat)</span>
          <span>経度 (lng)</span>
          <span>アクション</span>
        </div>

        {/* 行 */}
        {filtered.map((t, idx) => {
          const latValid = validateCoord(t.editLat);
          const lngValid = validateCoord(t.editLng);
          const sc = SOURCE_COLORS[t.source];
          return (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 130px 130px 130px",
                padding: "10px 16px",
                borderBottom: "1px solid #f1f5f9",
                alignItems: "center",
                gap: "8px",
                background: t.changed ? "#f0fdf4" : idx % 2 === 0 ? "#fff" : "#fafafa",
                transition: "background 0.2s",
              }}
            >
              {/* 番号 + ソース */}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 5px", borderRadius: "4px", background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                  {t.source}
                </span>
              </div>

              {/* 名前 + 住所 */}
              <div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                  {t.changed && <span style={{ fontSize: "0.7rem", background: "#16a34a", color: "#fff", padding: "1px 5px", borderRadius: "3px" }}>修正済</span>}
                  {t.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>{t.address}</div>
              </div>

              {/* 緯度 */}
              <input
                type="number"
                step="0.0001"
                value={t.editLat}
                onChange={e => handleField(t.id, "editLat", e.target.value)}
                style={{
                  width: "100%", padding: "6px 8px", borderRadius: "6px", fontSize: "0.82rem",
                  border: `1.5px solid ${latValid ? (t.changed ? "#86efac" : "#e2e8f0") : "#fca5a5"}`,
                  outline: "none", background: latValid ? "#fff" : "#fef2f2",
                  boxSizing: "border-box",
                }}
              />

              {/* 経度 */}
              <input
                type="number"
                step="0.0001"
                value={t.editLng}
                onChange={e => handleField(t.id, "editLng", e.target.value)}
                style={{
                  width: "100%", padding: "6px 8px", borderRadius: "6px", fontSize: "0.82rem",
                  border: `1.5px solid ${lngValid ? (t.changed ? "#86efac" : "#e2e8f0") : "#fca5a5"}`,
                  outline: "none", background: lngValid ? "#fff" : "#fef2f2",
                  boxSizing: "border-box",
                }}
              />

              {/* アクション */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  onClick={() => autoGeocode(t)}
                  title="住所から座標を自動取得"
                  style={{ padding: "4px 8px", fontSize: "0.72rem", borderRadius: "5px", border: "1px solid #93c5fd", background: "#eff6ff", cursor: "pointer", color: "#1d4ed8", whiteSpace: "nowrap", fontWeight: "bold" }}
                >
                  🤖 自動取得
                </button>
                <button
                  onClick={() => openMaps(t)}
                  title="施設名でGoogleマップ検索"
                  style={{ padding: "4px 8px", fontSize: "0.72rem", borderRadius: "5px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", color: "#334155", whiteSpace: "nowrap" }}
                >
                  🔍 住所で検索
                </button>
                <button
                  onClick={() => openCurrentCoord(t)}
                  title="現在入力中の座標をGoogleマップで確認"
                  style={{ padding: "4px 8px", fontSize: "0.72rem", borderRadius: "5px", border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", color: "#334155", whiteSpace: "nowrap" }}
                >
                  📌 現在座標
                </button>
                {t.changed && (
                  <button
                    onClick={() => resetRow(t.id)}
                    style={{ padding: "4px 8px", fontSize: "0.72rem", borderRadius: "5px", border: "1px solid #fca5a5", background: "#fff5f5", cursor: "pointer", color: "#dc2626", whiteSpace: "nowrap" }}
                  >
                    ↩ 元に戻す
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
            「{filter}」に一致する施設が見つかりません
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "16px", fontSize: "0.78rem", color: "#94a3b8" }}>
        V4 (サンプルデータ) 15件 ＋ V9 (オープンデータ) 52件 ＝ 合計 67件 ／ V10修正（みどりの駅・カスミみどりの店）適用済み
      </div>
    </div>
  );
}