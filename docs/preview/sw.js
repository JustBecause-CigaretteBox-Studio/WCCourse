const CACHE_NAME = 'yeji-course-v3';
const CACHE_URLS = [
  './index.html',
  './开始之前.html',
  './编程入门教程.html',
  './编程入门教程第二章.html',
  './编程入门教程第三章.html',
  './编程入门教程第四章.html',
  './编程入门教程第五章.html',
  './编程入门教程第六章.html',
  './题目系统.html',
  './项目系统.html',
  './完成恭喜.html',
  './第二阶段预告.html',
  './捐赠.html',
  './images/ch6-game.png',
  './images/ch6-game-editor.png',
  './images/benefits-list.png',
  './images/ch4/ch4-img1.webp',
  './images/ch4/ch4-img2.webp',
  './images/ch4/ch4-img3.webp',
  './images/ch4/ch4-img4.webp',
  './images/ch4/ch4-img5.webp',
  './images/ch4/ch4-img6.webp',
  './images/ch4/ch4-img7.webp',
  './images/ch4/ch4-img8.webp',
  './images/ch4/ch4-img9.webp'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(CACHE_URLS);
  }));
});

self.addEventListener('activate', function(e) {
  self.clients.claim();
  e.waitUntil(caches.keys().then(function(names) {
    return Promise.all(
      names.filter(function(n) { return n !== CACHE_NAME; })
           .map(function(n) { return caches.delete(n); })
    );
  }));
});

/* 第二阶段有 100+ 个页面、约 3.7MB，不适合在 install 阶段全量预缓存，
   这里只预缓存第一阶段核心文件；其余（含第二阶段）在访问时按需入缓存。 */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(response) {
      if (response) return response;
      return fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, copy);
          });
        }
        return res;
      }).catch(function() {
        // 离线兜底：导航请求回主页，其余不响应
        if (e.request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
