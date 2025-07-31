/**
	* Service Worker for Wesnoth Tools Suite
	* Version: 1.19
	* Cache Strategy: Cache First, then Network
*/
const CACHE_NAME = 'wesnoth-tools-v19';
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
    '/assets/icons/icon-72.png',
	'/assets/icons/icon-192.png',
	'/assets/icons/icon-512.png',
	'/assets/icons/icon-maskable.png',
	'/assets/icons/unit-com-icon-192.png',
	'/assets/icons/po-man-icon-192.png',
	'/assets/icons/story-mode-icon-192.png',
	'/assets/icons/event-man-icon-192.png',
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
});

self.addEventListener('push', event => {
    let title, body, url;
    
    try {
        // Try to parse as JSON first
        const data = event.data.json();
        title = data.title;
        body = data.body;
        url = data.url || '/';
    } catch (e) {
        // Fallback to text if JSON parsing fails
        const text = event.data.text();
        title = 'Wesnoth Tools';
        body = text;
        url = '/';
    }

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/icon-72.png',
            data: { url: url }
        })
    );
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
self.addEventListener('message', event => {
    if (event.data.type === 'version-update') {
        self.registration.showNotification(event.data.title, {
            body: event.data.body,
            icon: '/assets/icons/icon-192.png',
            badge: '/assets/icons/icon-72.png',
            data: { url: event.data.url }
        });
    }
});
// Add to the bottom of the file
self.addEventListener('sync', event => {
    if (event.tag === 'wts-data-sync') {
        console.log('Background Sync triggered');
        event.waitUntil(handleSync());
    }
});

self.addEventListener('periodicsync', event => {
    if (event.tag === 'wts-periodic-sync') {
        console.log('Periodic Sync triggered');
        event.waitUntil(handleSync());
    }
});

async function handleSync() {
    try {
        // Check if data needs synchronization
        const needsSync = await checkDataStatus();
        
        if (needsSync) {
            // Perform synchronization
            await synchronizeData();
            console.log('Data synchronized successfully');
        }
        
        // Always check for updates
        return checkForUpdates();
    } catch (error) {
        console.error('Sync failed:', error);
        return Promise.reject(error);
    }
}
async function checkDataStatus() {
    // Implement a logic to check if data needs synchronization
    // For example: compare local data with server data
    return true; // Return true if sync needed
}
async function synchronizeData() {
    // Implement a data synchronization logic here
    // For example: upload local changes to server
    console.log('Synchronizing data...');
    // Add an actual sync logic
}

async function checkForUpdates() {
    try {
        const response = await fetch('/version.json');
        const data = await response.json();
        const currentVersion = '1.19';
        
        if (data.version !== currentVersion) {
            // Notify about update
            self.registration.showNotification('Update Available', {
                body: `New version ${data.version} is available!`,
                icon: '/assets/icons/icon-192.png'
            });
            return true;
        }
        return false;
    } catch (error) {
        console.error('Update check failed:', error);
        return false;
    }
}