/**
	* Service Worker for Wesnoth Tools Suite
	* Version: 1.42
	* Cache Strategy: Cache First, then Network
*/
const CACHE_NAME = 'wesnoth-tools-v42';
const OFFLINE_URL = '/offline.html';
const SYNC_TAG = 'wts-background-sync';
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
	'/scripts/i18n_fr.js',
	'/scripts/i18n_it.js',
	'/scripts/i18n_de.js',
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
const APP_VERSION = "1.42";


// Install Event - Cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches
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
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-first strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(event.request);
          const responseClone = networkResponse.clone();
          
          // Cache the response
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          
          return networkResponse;
        } catch (error) {
          // Network failed - try cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          
          // Fallback to offline page
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // Handle all other requests
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached version if available
      if (cachedResponse) return cachedResponse;
      
      // Otherwise go to network
      return fetch(event.request).then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(error => {
        // Return error response for non-HTML
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Push Notification Event
self.addEventListener('push', event => {
	const title = 'Wesnoth Tools Update';
	const options = {
		body: `New version ${APP_VERSION} is available! Click to learn more.`, // ✅ Use APP_VERSION
		icon: '/assets/icons/icon-192.png',
		badge: '/assets/icons/icon-72.png',
		data: {
			url: '/documentation.html?version=' + APP_VERSION // ✅ Use APP_VERSION
		}
	};
	
	event.waitUntil(
		self.registration.showNotification(title, options)
	);
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
	event.notification.close();
	const url = event.notification.data.url || '/';
	event.waitUntil(
		clients.openWindow(url)
	);
});

// Message Event Handler
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'VERSION_UPDATE') {
		const title = 'Wesnoth Tools Update';
		const options = {
			body: `New version ${event.data.version} is available!`,
			icon: '/assets/icons/icon-192.png',
			data: {
				url: '/documentation.html?version=' + event.data.version
			}
		};
		
		event.waitUntil(
			self.registration.showNotification(title, options)
		);
	}
});
function handleSyncRequest(request) {
    return request.json().then(syncData => {
        // Store sync data in IndexedDB
        return idbKeyVal.set('syncQueue', syncData).then(() => {
            // Trigger background sync
            return self.registration.sync.register(SYNC_TAG);
        });
    }).then(() => {
        return new Response(JSON.stringify({ status: 'queued' }), {
            status: 202,
            headers: { 'Content-Type': 'application/json' }
        });
    });
}

self.addEventListener('sync', event => {
    if (event.tag === SYNC_TAG) {
        event.waitUntil(processSyncQueue());
    }
});

async function processSyncQueue() {
    const syncData = await idbKeyVal.get('syncQueue');
    if (!syncData) return;
    
    try {
        // Get user's sync settings
        const settings = await idbKeyVal.get('syncSettings') || {};
        const syncMethod = settings.method || 'manual';
        const syncInterval = settings.interval || 60;
        
        // Process based on settings
        if (syncMethod === 'auto') {
            await processAutoSync(syncData, syncInterval);
        } else {
            await processManualSync(syncData);
        }
        
        // Clear queue after successful sync
        await idbKeyVal.del('syncQueue');
    } catch (error) {
        console.error('Sync processing failed:', error);
        // Retry later
        setTimeout(() => self.registration.sync.register(SYNC_TAG), 60000);
    }
}

async function processAutoSync(data, interval) {
    // Implement actual sync logic with your server
    // This is a placeholder for the real implementation
    const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Auto sync failed');
    }
    
    // Schedule next sync if periodic sync is enabled
    if (interval > 0) {
        setTimeout(() => self.registration.sync.register(SYNC_TAG), interval * 60000);
    }
}

async function processManualSync(data) {
    // Store for manual sync trigger
    await idbKeyVal.set('pendingManualSync', data);
    
    // Show notification to user
    await self.registration.showNotification('Sync Ready', {
        body: 'You have pending sync operations',
        actions: [{ action: 'sync', title: 'Sync Now' }]
    });
}

// Add IndexedDB helper
const idbKeyVal = {
    db: null,
    init() {
        if (this.db) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('wts-sync-db', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            request.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('syncStore')) {
                    db.createObjectStore('syncStore');
                }
            };
        });
    },
    async get(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('syncStore', 'readonly');
            const store = tx.objectStore('syncStore');
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
        });
    },
    async set(key, value) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('syncStore', 'readwrite');
            const store = tx.objectStore('syncStore');
            store.put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    },
    async del(key) {
        await this.init();
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('syncStore', 'readwrite');
            const store = tx.objectStore('syncStore');
            store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }
};

// Add notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'sync') {
        event.waitUntil(
            self.registration.sync.register(SYNC_TAG).then(() => {
                console.log('Manual sync triggered');
            })
        );
    }
});