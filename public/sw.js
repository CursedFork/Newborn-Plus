// Newborn+ Service Worker
// Caches the app shell for offline use; queues failed writes to sync on reconnect.

const CACHE_NAME = 'newborn-v2'
const APP_SHELL = [
  '/',
  '/home',
  '/login',
  '/trends',
  '/history',
  '/ped-notes',
  '/export',
  '/settings',
]

// ── Install: cache app shell ───────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

// ── Activate: clear old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API/auth; cache-first for static assets ──────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Always pass through Supabase API, auth, and Next.js internals
  if (
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/auth/')
  ) {
    event.respondWith(fetch(event.request))
    return
  }

  // Cache-first for static assets
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|svg|ico|woff2?|css)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request))
    )
    return
  }

  // Network-first for pages — fall back to cache when offline
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? new Response('Offline', { status: 503 })))
  )
})

// ── Background sync: flush offline write queue ────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'offline-write-queue') {
    event.waitUntil(flushOfflineQueue())
  }
})

async function flushOfflineQueue() {
  // The queue is managed by the app via postMessage; the SW just notifies
  // all clients to flush their queue when back online.
  const clients = await self.clients.matchAll({ type: 'window' })
  clients.forEach((client) => client.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' }))
}

// ── Message from app ──────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
