// 環境変数 (VITE_API_BASE_URL) を読み込んで定数としてエクスポートします
// .env ファイルがない場合や読み込めない場合の保険として、|| の後ろにデフォルト値を書いています
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/toilets';