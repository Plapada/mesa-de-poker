/* Service worker da versão de celular: guarda o app no aparelho para abrir sem internet.
   A página (o app inteiro, num arquivo só) vem primeiro da rede, para pegar a versão nova assim que
   houver internet; sem internet, sai da cópia guardada. Os ícones e o manifesto saem da cópia. */
const CACHE = 'mesa-de-poker'
const ARQUIVOS = ['./', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png', 'icone-mascara-512.png', 'apple-touch-icon.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copia = r.clone()
          caches.open(CACHE).then((c) => c.put('./', copia))
          return r
        })
        .catch(() => caches.match('./')),
    )
    return
  }
  e.respondWith(caches.match(req).then((r) => r || fetch(req)))
})
