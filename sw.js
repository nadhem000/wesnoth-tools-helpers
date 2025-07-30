/**
	* Service Worker for Wesnoth Tools Suite
	* Version: 1.11
	* Cache Strategy: Cache First, then Network
*/
const CACHE_NAME = 'wesnoth-tools-v12';
const OFFLINE_URL = 'offline.html';
const PRECACHE_URLS = [
	'/',
	'/index.html',
	'/offline.html',
	'/ressources/about.html',
	'/ressources/documentation.html',
	'/ressources/events_manager.html',
	'/ressources/story_mode.html',
	'/ressources/sounds_manager.html',
	'/ressources/gif_creator.html',
	'/ressources/big_map_tracker.html',
	'/ressources/po_dictionary_manager.html',
	'/ressources/po_manager.html',
	'/ressources/unit_comparator.html',
	'/ressources/images_manager.html',
	'/ressources/images_animation_manager.html',
	'/ressources/sample.html',
	'/styles/main.css',
	'/styles/about.css',
	'/styles/documentation.css',
	'/styles/events_manager.css',
	'/styles/story_mode.css',
	'/styles/sounds_manager.css',
	'/styles/gif_creator.css',
	'/styles/big_map_tracker.css',
	'/styles/po_dictionary_manager.css',
	'/styles/po_manager.css',
	'/styles/unit_comparator.css',
	'/styles/images_manager.css',
	'/styles/images_animation_manager.css',
	'/styles/sample.css',
	'/scripts/main.js',
	'/scripts/about.js',
	'/scripts/navigation.js',
	'/scripts/documentation.js',
	'/scripts/events_manager.js',
	'/scripts/story_mode.js',
	'/scripts/sounds_manager.js',
	'/scripts/wesnoth-wml-utils.js',
	'/scripts/gif_creator.js',
	'/scripts/big_map_tracker.js',
	'/scripts/po_dictionary_manager.js',
	'/scripts/po_manager.js',
	'/scripts/unit_comparator.js',
	'/scripts/images_manager.js',
	'/scripts/images_animation_manager.js',
	'/scripts/sample.js',
	'/scripts/i18n.js',
	'/templates/header.html',
	'/templates/footer.html',
	'/assets/icons/icon-192.png',
	'/assets/icons/icon-512.png',
	'/assets/icons/icon-maskable.png',
	'/assets/halos/fireball-impact-2.png',
	'/assets/halos/flame-burst-1.png',
	'/assets/halos/mage-halo1.png',
	'/assets/screenshots/screenshot_01.png',
	'/assets/screenshots/screenshot_02.png',
	'/assets/screenshots/screenshot_03.png',
	'/assets/sounds/bow.ogg',
	'/assets/sounds/flail.ogg',
	'/assets/sounds/human-die-1.ogg',
	'/assets/sounds/magic-holy-1.ogg',
	'/assets/sounds/sword-1.ogg'
];

// Install Event
self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => {
			// Normalize paths for deployment
			const cacheUrls = PRECACHE_URLS.map(url => 
				url.startsWith('/') ? url : '/' + url
			);
			return cache.addAll(cacheUrls);
		})
	);
	
	self.addEventListener('push', event => {
		const data = event.data.json();
		event.waitUntil(
			self.registration.showNotification(data.title, {
				body: data.body,
				icon: '/assets/icons/icon-192.png',
				badge: '/assets/icons/icon-72.png',
				data: { url: data.url }
			})
		);
	});
	
	
});

// Fetch Event
self.addEventListener('fetch', event => {
	if (event.request.method !== 'GET') return;
	
	const requestUrl = new URL(event.request.url);
	
	// Unified handling for both file:// and https://
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
	self.addEventListener('notificationclick', event => {
		event.notification.close();
		event.waitUntil(
			clients.openWindow(event.notification.data.url)
		);
	});
});