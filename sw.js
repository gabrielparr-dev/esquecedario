/* Esquecedário: guarda o app no aparelho para abrir sem internet.
   As notas não passam por aqui: ficam no armazenamento do navegador, só neste aparelho. */
const CACHE = 'esquecedario-5bfd2147e5';
const ARQUIVOS = ["./", "index.html", "manifest.webmanifest", "icones/apple-touch-icon.png", "icones/icone-192.png", "icones/icone-512.png", "icones/icone.svg"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // a página: tenta a versão nova; sem internet, usa a guardada
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
