// ===== Miracles Scores Service Worker =====
// バージョン番号：HTMLや本ファイルを更新するたびに数字を上げてください
// 例: v1.0.0 → v1.0.1 → v1.0.2 ...
const CACHE_VERSION = '2026-09-05-0004';
const CACHE_NAME = 'miracles-scores-' + CACHE_VERSION;

// オフラインで動くようにキャッシュしておくファイル
const CACHE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

// インストール時：必要ファイルをキャッシュに保存
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // 個別にaddして失敗してもインストールが止まらないようにする
      return Promise.all(
        CACHE_FILES.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('[SW] Failed to cache:', url, err);
          });
        })
      );
    })
  );
  // 新しいSWを即座に有効化
  self.skipWaiting();
});

// 有効化時：古いバージョンのキャッシュを削除
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// fetch時：Network-First戦略
// オンラインなら常に最新を取得、ダメならキャッシュにフォールバック
self.addEventListener('fetch', function(event) {
  var req = event.request;

  // GET以外は素通し
  if (req.method !== 'GET') return;

  // Firebase/Firestore/外部CDNなどはキャッシュせず素通し
  // (リアルタイム同期を妨げないため)
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req).then(function(networkRes) {
      // 成功したらキャッシュも更新
      if (networkRes && networkRes.status === 200) {
        var resClone = networkRes.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(req, resClone);
        });
      }
      return networkRes;
    }).catch(function() {
      // ネットワーク失敗時はキャッシュから返す
      return caches.match(req).then(function(cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

// クライアントからのメッセージ受信
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
