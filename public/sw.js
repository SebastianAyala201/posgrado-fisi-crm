// Service worker mínimo: guarda en caché las páginas visitadas para abrir rápido
// y permite instalar el portal como app en celular y escritorio (PWA).
const CACHE = 'admision-fisi-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(request)
      .then((r) => { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(request, copia)); return r; })
      .catch(() => caches.match(request))
  );
});
