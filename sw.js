const APP_PREFIX = 'MTG_';
const VERSION = 'v2';
const CACHE_NAME = APP_PREFIX + VERSION;
const URLS = [
    './',
    './index.html',
    './index.js',
    './audio.js',
    './cell.js',
    './gem.js',
    './grid.js',
    './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Installing cache: ' + CACHE_NAME);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key.startsWith(APP_PREFIX) && key !== CACHE_NAME) {
                        console.log('Deleting outdated cache: ' + key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                // Optionally cache fetched resources here if needed
                return networkResponse;
            }).catch(() => {
                // Offline fallback if needed
                console.log('Fetch failed; returning offline page instead.', e.request.url);
            });
        })
    );
});
