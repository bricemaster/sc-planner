// sw.js — Service Worker for offline support
const CACHE_NAME = 'sc-planner-v20';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/tokens.css',
  './css/shell.css',
  './css/components.css',
  './css/views.css',
  './css/onboarding.css',
  './css/polish.css',
  './css/polish-v2.css',
  './css/dashboard.css',
  './css/micro.css',
  './css/powertools.css',
  './css/favorites.css',
  './css/features-a.css',
  './css/data-views.css',
  './css/qol.css',
  './css/a11y.css',
  './lib/app.js',
  './lib/utils.js',
  './lib/themes.js',
  './lib/modal.js',
  './lib/picker.js',
  './lib/favorites.js',
  './lib/advisor.js',
  './lib/gsearch.js',
  './lib/livedata.js',
  './lib/powertools.js',
  './lib/planner.js',
  './lib/renderer.js',
  './lib/effects.js',
  './lib/features-a.js',
  './lib/data-extended.js',
  './lib/a11y.js',
  './lib/qol.js',
  './data/ships.js',
  './data/methods.js',
  './data/routes.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = event.request.url;

  // API calls: network-first, cache fallback
  if (url.includes('uexcorp.space') || url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request).then(c => c || new Response('{}', { status: 503 })))
    );
    return;
  }

  // Static assets: stale-while-revalidate (serve cached, update in background)
  if (url.endsWith('.css') || url.endsWith('.js') || url.endsWith('.html') || url.endsWith('.json')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);

        return cached || fetchPromise;
      })
    );
    return;
  }

  // Everything else: cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
