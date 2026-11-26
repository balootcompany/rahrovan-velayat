const CACHE_NAME = 'rahrovan-velayat-v2';
const ASSETS = ['./', './index.html', './app.js', './manifest.json'];
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(()=>{})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then((cached) => {
    if (cached) {
      fetch(event.request).then((res) => { if (res && res.status === 200) caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone())); }).catch(()=>{});
      return cached;
    }
    return fetch(event.request).then((res) => {
      if (res && res.status === 200) {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
      }
      return res;
    }).catch(() => caches.match('./index.html'));
  }));
});
