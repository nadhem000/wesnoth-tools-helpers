const CACHE_NAME = 'wesnoth-tools-v3'; // Updated version
const urlsToCache = [
    '/',
    '/index.html',
    '/scripts/main.js',
    '/scripts/moduleLoader.js',
    '/scripts/event_message_extractor.js',
    '/styles/dashboard.css',
    '/styles/Wesnoth_Scenario_Event_Message_Extractor.css',
    '/styles/Wesnoth_Scenario_Story_Extractor.css',
    '/modules/story_extractor.html',
    '/scripts/story_extractor.js'
    // Fallback page
    '/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Handle navigation requests separately
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/offline.html'))
        );
        return;
    }
    
    // For all other requests
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached response if found
                if (cachedResponse) return cachedResponse;
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(networkResponse => {
                        // Cache new responses
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline page for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map(cacheName => {
                if (!cacheWhitelist.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            })
        ))
    );
});