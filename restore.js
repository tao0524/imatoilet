const fs = require('fs');
const path = require('path');

// 1. 読み込むバックアップファイル名
const BACKUP_FILE = 'repomix-output.xml';

// 2. プロジェクトのルートパス (現在の場所)
const ROOT_DIR = __dirname;

function unescapeXml(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function restore() {
  const backupPath = path.join(ROOT_DIR, BACKUP_FILE);

  if (!fs.existsSync(backupPath)) {
    console.error(`❌ エラー: バックアップファイルが見つかりません: ${BACKUP_FILE}`);
    console.error(`   この restore.js と同じ場所に ${BACKUP_FILE} を置いてください。`);
    return;
  }

  console.log(`📂 バックアップを読み込んでいます: ${BACKUP_FILE}...`);
  const content = fs.readFileSync(backupPath, 'utf-8');

  // <file path="..."> のパターンを検索
  const regex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  let match;
  let count = 0;

  while ((match = regex.exec(content)) !== null) {
    const filePath = match[1];
    const fileContent = unescapeXml(match[2]).trim(); // XMLのエスケープを戻し、前後の空白を除去

    // 復元対象のパスを作成
    const targetPath = path.join(ROOT_DIR, filePath);
    const targetDir = path.dirname(targetPath);

    // .metadata や eclipse 関連の設定ファイルはスキップ（トラブル防止のため）
    if (filePath.startsWith('.metadata') || filePath.includes('.settings')) {
        continue;
    }

    // ディレクトリが存在しなければ作成
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // ファイルを書き込み（上書き）
    fs.writeFileSync(targetPath, fileContent + '\n', 'utf-8');
    console.log(`✅ 復元: ${filePath}`);
    count++;
  }

  console.log('--------------------------------------------------');
  console.log(`🎉 復元完了！ 合計 ${count} 個のファイルを正常な状態に戻しました。`);
  console.log('--------------------------------------------------');
}

restore();