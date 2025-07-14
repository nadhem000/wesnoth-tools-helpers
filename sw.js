/**
	* Service Worker for Wesnoth Tools Suite
	* Version: 1.0
	* Cache Strategy: Cache First, then Network
*/
const CACHE_NAME = 'wesnoth-tools-v2';
const OFFLINE_URL = 'offline.html';
const PRECACHE_URLS = [
	'/',
	'/index.html',
	'/offline.html',
	'/ressources/about.html',
	'/ressources/documentation.html',
	'/ressources/events_manager.html',
	'/styles/main.css',
	'/styles/about.css',
	'/styles/documentation.css',
	'/styles/events_manager.css',
	'/scripts/main.js',
	'/scripts/about.js',
	'/scripts/navigation.js',
	'/scripts/documentation.js',
	'/scripts/events_manager.js',
	'/scripts/wesnoth-wml-utils.js',
	'/scripts/i18n.js',
	'/templates/header.html',
	'/templates/footer.html',
	'/assets/icons/icon-192.png',
	'/assets/icons/icon-512.png'
];

// Install Event
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => cache.addAll(PRECACHE_URLS))
	);
});

// Fetch Event
self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') return;
	
	const requestUrl = new URL(event.request.url);
	
	// Handle file:// protocol
	if (requestUrl.protocol === 'file:') {
		event.respondWith(
			caches.match(event.request).then(response => {
				return response || fetch(event.request);
			})
		);
		return;
	}
	
	// Existing HTTPS handling
	event.respondWith(
		caches.match(event.request).then(cachedResponse => {
			if (cachedResponse) return cachedResponse;
			
			return fetch(event.request).then(response => {
				if (response && response.status === 200) {
					const responseToCache = response.clone();
					caches.open(CACHE_NAME).then(cache => {
						cache.put(event.request, responseToCache);
					});
				}
				return response;
				}).catch(() => {
				if (event.request.mode === 'navigate') {
					return caches.match(OFFLINE_URL);
				}
			});
		})
	);
});

// Activate Event (Clean old caches)
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});