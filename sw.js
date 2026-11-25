/* Тренировки: offline cache. The version changes with every build, so a new build replaces the old files. */
const V = 'trenirovki-75d235181a';
const FILES = ["./", "index.html", "three.min.js", "firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js", "manifest.webmanifest", "flame-180.png", "flame-192.png", "flame-512.png", "flame-maskable-512.png"];
self.addEventListener('install', e => {
  /* cache: 'reload' skips the browser's HTTP cache, so a new version never stores an older file */
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('trenirovki-') && k !== V && k !== 'trenirovki-fonts').map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    const key = r.mode === 'navigate' ? 'index.html' : r;
    e.respondWith(caches.open(V).then(c => c.match(key, { ignoreSearch: true })
      .then(hit => hit || fetch(r).then(res => { if (res && res.ok && r.mode !== 'navigate') c.put(r, res.clone()); return res; }))));
    return;
  }
  if (FONTS.test(r.url)) {
    e.respondWith(caches.open('trenirovki-fonts').then(c => c.match(r)
      .then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }))));
  }
});
