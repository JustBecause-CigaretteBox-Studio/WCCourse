const CACHE_NAME = 'yeji-course-v1';
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
  './images/ch6-game-editor.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    return cache.addAll(CACHE_URLS);
  }));
});

self.addEventListener('fetch', function(e) {
  e.respondWith(caches.match(e.request).then(function(response) {
    return response || fetch(e.request);
  }));
});
