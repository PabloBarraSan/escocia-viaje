const CACHE = 'escocia-shell-v3'
const APP_SHELL = ['/', '/manifest.json', '/icon.svg']
const IMAGES = [
  '/images/day-1.jpg', '/images/day-2.jpg', '/images/day-3.jpg', '/images/day-4.jpg',
  '/images/day-5.jpg', '/images/day-6.jpg', '/images/day-7.jpg', '/images/day-8.jpg',
  '/images/login.jpg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...APP_SHELL, ...IMAGES])))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || url.hostname.includes('supabase.co') || url.pathname.includes('/reservas')) return

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('/')))
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })),
    )
  }
})
