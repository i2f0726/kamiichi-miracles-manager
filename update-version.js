// ===================================================================
// sw.js のバージョンを自動更新するスクリプト（ミニバス用）
// npm run deploy 実行時に自動で走ります
//
// 対象:
//   - ルートの sw.js（メインダッシュボード用）
//   - scores/sw.js（スコアボード用）
//   今後 PWA を増やしたら TARGETS 配列に追加するだけ
// ===================================================================

const fs = require('fs');
const path = require('path');

// 更新対象のsw.jsをここに列挙
const TARGETS = [
  path.join(__dirname, 'sw.js'),
  path.join(__dirname, 'scores', 'sw.js'),
];

// 今の日時から バージョン文字列を作る（例: 2026-04-29-1430）
function makeVersion() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}-${hh}${mm}`;
}

const newVersion = makeVersion();
let updatedCount = 0;
let skippedCount = 0;

TARGETS.forEach((swPath) => {
  const label = path.relative(__dirname, swPath);

  if (!fs.existsSync(swPath)) {
    console.log(`⏭️  スキップ（ファイルなし）: ${label}`);
    skippedCount++;
    return;
  }

  let content = fs.readFileSync(swPath, 'utf8');
  const before = content;

  // const CACHE_VERSION = '...' の部分を書き換え
  content = content.replace(
    /const\s+CACHE_VERSION\s*=\s*['"][^'"]*['"]\s*;/,
    `const CACHE_VERSION = '${newVersion}';`
  );

  if (content === before) {
    console.warn(`⚠️  CACHE_VERSION が見つかりません: ${label}`);
    skippedCount++;
    return;
  }

  fs.writeFileSync(swPath, content, 'utf8');
  console.log(`✅ ${label} → ${newVersion}`);
  updatedCount++;
});

console.log(`\n📦 ${updatedCount}件更新 / ${skippedCount}件スキップ`);

// 1件も更新できなかった場合はエラー終了
if (updatedCount === 0) {
  console.error('❌ どのsw.jsも更新できませんでした');
  process.exit(1);
}
