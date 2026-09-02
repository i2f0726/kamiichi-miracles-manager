// ===================================================================
// GitHub Pages 自動デプロイスクリプト（ミニバス女子・ミラクルズ用）
// 1. git add .
// 2. git commit -m "auto deploy YYYY-MM-DD HH:MM"
// 3. git push
// ===================================================================

const { execSync } = require('child_process');

// 日時付きコミットメッセージ
function makeCommitMessage() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `auto deploy ${y}-${m}-${d} ${hh}:${mm}`;
}

const commitMessage = makeCommitMessage();

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

try {
  // 変更があるか確認
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  if (!status.trim()) {
    console.log('\n📭 変更なし。デプロイは不要です。');
    process.exit(0);
  }

  // git add → commit → push
  run('git add .');
  run(`git commit -m "${commitMessage}"`);
  run('git push');

  console.log('\n🎉 GitHub Pages へのデプロイが完了しました！');
  console.log('   反映には1〜2分かかります。');
  console.log('   URL: https://（あなたのGitHubユーザー名）.github.io/kamiichi-miracles-manager/\n');
} catch (err) {
  console.error('\n❌ エラーが発生しました:');
  console.error(err.message);
  process.exit(1);
}
