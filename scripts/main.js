/** 
	* Main JavaScript for Index Page 
	* @file Handles core functionality for the main dashboard 
	* @version 1.2 
*/ 

// Auto-update interval tracker
let updateIntervalId = null;
// Synchronisation tracker
let syncEnabled = false;
let syncMode = 'manual';
let syncInterval = 'daily';
// Improved navigation handler
function setupNavigation() {
    try {
        const isInRessources = window.location.pathname.includes('ressources');
        const isLocalFile = window.location.protocol === 'file:';
        
        // Tools dropdown items
        document.querySelectorAll('.wts-index-dropdown-content a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                let href = link.getAttribute('href');
                
                // Handle deployed environment
                if (!isLocalFile) {
                    // Always use root-relative paths in deployment
                    window.location.href = href;
				} 
                // Handle local file system
                else {
                    if (isInRessources) {
                        // Handle paths for ressources section
                        window.location.href = href.replace('ressources/', '');
						} else {
                        // Handle paths from root section
                        window.location.href = href;
					}
				}
			});
		});
		
		// Documentation button
		document.getElementById('wts-index-documentation')?.addEventListener('click', () => {
			window.location.href = isInRessources 
			? (isLocalFile ? 'documentation.html' : '/documentation.html')
			: (isLocalFile ? 'ressources/documentation.html' : '/ressources/documentation.html');
		});
		
		// About button
		document.getElementById('wts-index-about')?.addEventListener('click', () => {
			window.location.href = isInRessources 
			? (isLocalFile ? 'about.html' : '/about.html')
			: (isLocalFile ? 'ressources/about.html' : '/ressources/about.html');
		});
		} catch (e) {
		console.warn('Navigation setup failure', e);
	}
}

// Unified service worker registration
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		const isLocalFile = window.location.protocol === 'file:';
		const isInRessources = window.location.pathname.includes('ressources');
		
		let swPath;
		if (isLocalFile) {
			swPath = isInRessources ? '../sw.js' : 'sw.js';
			} else {
			swPath = '/sw.js';
		}
		
		navigator.serviceWorker.register(swPath)
		.then(reg => console.log('SW registered: ', reg))
		.catch(err => console.log('SW registration failed: ', err));
	});
}

// Auto-update settings functions
function loadUpdateSettings() {
    const autoUpdateCheck = document.getElementById('wts-auto-updates');
    const intervalContainer = document.getElementById('wts-interval-container');
    const updateInterval = document.getElementById('wts-update-interval');
    
    if (!autoUpdateCheck || !intervalContainer || !updateInterval) return;
    
    const autoUpdate = localStorage.getItem('wts-auto-updates') === 'true';
    const interval = localStorage.getItem('wts-update-interval') || 'daily';
    
    autoUpdateCheck.checked = autoUpdate;
    updateInterval.value = interval;
    
    if (autoUpdate) {
        intervalContainer.style.display = 'flex';
        startUpdateInterval(interval);
	}
}

function startUpdateInterval(interval) {
    if (updateIntervalId) clearInterval(updateIntervalId);
    
    const intervals = {
        hourly: 60 * 60 * 1000,
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000
	};
    
    const intervalMs = intervals[interval] || intervals.daily;
    updateIntervalId = setInterval(checkForUpdates, intervalMs);
    checkForUpdates();
}
// DOM Ready Handler
document.addEventListener('DOMContentLoaded', () => {
	
	/* i18n.init(); */
    // Tooltip initialization 
    document.querySelectorAll('.wts-index-tooltip').forEach(el => {
		const key = el.getAttribute('data-i18n');
		if (key) { // Add null check
			const translation = i18n.t(key);
			el.title = translation || 'Tooltip';
		}
	}); 
	
	// Theme Toggle 
	const themeToggle = document.getElementById('wts-theme-toggle'); 
	const themeIcon = themeToggle.querySelector('svg'); 
	
	// Function to set theme 
	function setTheme(theme) {
		if (theme === 'dark') {
			document.documentElement.setAttribute('data-theme', 'dark');
			// Update toggle button SVG for dark mode
			const themeToggle = document.getElementById('wts-theme-toggle');
			themeToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
			} else {
			document.documentElement.removeAttribute('data-theme');
			// Update toggle button SVG for light mode
			const themeToggle = document.getElementById('wts-theme-toggle');
			themeToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"/></svg>`;
		}
		localStorage.setItem('wts-theme', theme);
		themeToggle.title = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
	}
	
	// Initialize theme 
	const savedTheme = localStorage.getItem('wts-theme') || 'light'; 
	setTheme(savedTheme); 
	
	// Toggle theme on button click 
	themeToggle.addEventListener('click', () => { 
		const currentTheme = document.documentElement.hasAttribute('data-theme') ? 'dark' : 'light'; 
		const newTheme = currentTheme === 'light' ? 'dark' : 'light'; 
		setTheme(newTheme); 
	}); 
	
	// Add tooltip for theme button
	themeToggle.title = savedTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
    
	
    // Offline detection
    if (!navigator.onLine) {
        const offlineMsg = document.createElement('p');
        offlineMsg.className = 'wts-index-offline';
        offlineMsg.setAttribute('data-i18n', 'offline.message');
		offlineMsg.textContent = i18n.t('offline.message') || 'Offline Mode';
        document.querySelector('.wts-index-footer').appendChild(offlineMsg);
	}
	let deferredPrompt;
	
	// Install App button functionality
	document.getElementById('wts-install-btn')?.addEventListener('click', async () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`User response to the install prompt: ${outcome}`);
			deferredPrompt = null;
		}
	});
	
	// Capture install event
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		
		// Show install button
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) installBtn.style.display = 'block';
	});
	
	// Track app installation
	window.addEventListener('appinstalled', () => {
		console.log('PWA was installed');
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) installBtn.style.display = 'none';
	});
	
	// Capture install event
	window.addEventListener('beforeinstallprompt', (e) => {
		e.preventDefault();
		deferredPrompt = e;
		
		// Show install button
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) installBtn.style.display = 'block';
	});
	
	// Track app installation
	window.addEventListener('appinstalled', () => {
		console.log('PWA was installed');
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) installBtn.style.display = 'none';
	});
	
	// Language Selector Update
	document.querySelectorAll('.wts-index-dropdown-content a').forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const lang = link.getAttribute('data-lang');
			i18n.setLanguage(lang);
		});
	});
	const navRight = document.querySelector('.wts-index-nav-right');
	if (navRight) {
		navRight.querySelectorAll('.wts-index-dropdown-content a').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				const lang = link.getAttribute('data-lang');
				i18n.setLanguage(lang);
			});
		});
	}
    // Navigation handlers
    setupNavigation();
	// Notification toggle
	const notificationToggle = document.getElementById('wts-notification-toggle');
	let notificationsEnabled = localStorage.getItem('wts-notifications') === 'true';
	
	// toggle button appearance
	function updateNotificationToggle() {
		if (notificationsEnabled) {
			notificationToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>`;
			notificationToggle.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
			} else {
			notificationToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/></svg>`;
			notificationToggle.style.backgroundColor = '';
		}
		
		// Use i18n for translation
		notificationToggle.title = notificationsEnabled 
        ? i18n.t('notifications.disable') 
        : i18n.t('notifications.enable');
	}
	
	// Toggle notifications
	notificationToggle.addEventListener('click', () => {
		notificationsEnabled = !notificationsEnabled;
		localStorage.setItem('wts-notifications', notificationsEnabled);
		updateNotificationToggle();
		
		if (notificationsEnabled) {
			// Request permission
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					console.log('Notification permission granted.');
					} else {
					console.log('Unable to get permission to notify.');
				}
			});
		}
	});
	
	// Auto-update settings elements
    const autoUpdateCheck = document.getElementById('wts-auto-updates');
    const intervalContainer = document.getElementById('wts-interval-container');
    const updateInterval = document.getElementById('wts-update-interval');
    const checkNowBtn = document.getElementById('wts-check-now');
    
    if (autoUpdateCheck && intervalContainer && updateInterval && checkNowBtn) {
        // Event listeners
        autoUpdateCheck.addEventListener('change', () => {
            const enabled = autoUpdateCheck.checked;
            localStorage.setItem('wts-auto-updates', enabled);
            intervalContainer.style.display = enabled ? 'flex' : 'none';
            
            if (enabled) {
                startUpdateInterval(updateInterval.value);
				} else if (updateIntervalId) {
                clearInterval(updateIntervalId);
                updateIntervalId = null;
			}
		});
        
        updateInterval.addEventListener('change', () => {
            const interval = updateInterval.value;
            localStorage.setItem('wts-update-interval', interval);
            
            if (autoUpdateCheck.checked) {
                startUpdateInterval(interval);
			}
		});
        
        checkNowBtn.addEventListener('click', () => {
            checkForUpdates();
		});
	}
    
    // Sync Settings Elements
    const syncEnabledCheck = document.getElementById('wts-sync-enabled');
    const syncSettings = document.getElementById('wts-sync-settings');
    const syncManual = document.getElementById('wts-sync-manual');
    const syncAutomatic = document.getElementById('wts-sync-automatic');
    const syncIntervalContainer = document.getElementById('wts-sync-interval-container');
    const syncIntervalSelect = document.getElementById('wts-sync-interval');
    const syncNowBtn = document.getElementById('wts-sync-now');
	
    // Load sync settings
    function loadSyncSettings() {
        syncEnabled = localStorage.getItem('wts-sync-enabled') === 'true';
        syncMode = localStorage.getItem('wts-sync-mode') || 'manual';
        syncInterval = localStorage.getItem('wts-sync-interval') || 'daily';
        
        syncEnabledCheck.checked = syncEnabled;
        syncSettings.style.display = syncEnabled ? 'block' : 'none';
        
        if (syncMode === 'manual') {
            syncManual.checked = true;
            syncIntervalContainer.style.display = 'none';
			} else {
            syncAutomatic.checked = true;
            syncIntervalContainer.style.display = 'flex';
		}
        
        syncIntervalSelect.value = syncInterval;
	}
	
    // Save sync settings
    function saveSyncSettings() {
        localStorage.setItem('wts-sync-enabled', syncEnabled);
        localStorage.setItem('wts-sync-mode', syncMode);
        localStorage.setItem('wts-sync-interval', syncInterval);
	}
	
    // Event listeners
    syncEnabledCheck.addEventListener('change', () => {
        syncEnabled = syncEnabledCheck.checked;
        syncSettings.style.display = syncEnabled ? 'block' : 'none';
        saveSyncSettings();
        
        if (syncEnabled) {
            registerSync();
			} else {
            unregisterSync();
		}
	});
	
    syncManual.addEventListener('change', () => {
        syncMode = 'manual';
        syncIntervalContainer.style.display = 'none';
        saveSyncSettings();
	});
	
    syncAutomatic.addEventListener('change', () => {
        syncMode = 'automatic';
        syncIntervalContainer.style.display = 'flex';
        saveSyncSettings();
        startPeriodicSync();
	});
	
    syncIntervalSelect.addEventListener('change', () => {
        syncInterval = syncIntervalSelect.value;
        saveSyncSettings();
        startPeriodicSync();
	});
	
    syncNowBtn.addEventListener('click', () => {
        triggerSync();
	});
	
    // Register background sync
    async function registerSync() {
        if (!('serviceWorker' in navigator)) return;
        
        const registration = await navigator.serviceWorker.ready;
        
        // Register for background sync
        if ('sync' in registration) {
            await registration.sync.register('wts-data-sync');
            console.log('Background Sync registered');
		}
        
        // Register for periodic sync
        if ('periodicSync' in registration && syncMode === 'automatic') {
            await startPeriodicSync();
		}
	}
	
    // Unregister sync
    async function unregisterSync() {
        if (!('serviceWorker' in navigator)) return;
        
        const registration = await navigator.serviceWorker.ready;
        
        if ('sync' in registration) {
            await registration.sync.unregister('wts-data-sync');
		}
        
        if ('periodicSync' in registration) {
            await registration.periodicSync.unregister('wts-periodic-sync');
		}
	}
	
    // Start periodic sync
    async function startPeriodicSync() {
        if (!('periodicSync' in navigator) || !syncEnabled || syncMode !== 'automatic') return;
        
        const registration = await navigator.serviceWorker.ready;
        const intervals = {
            hourly: 60 * 60 * 1000,
            daily: 24 * 60 * 60 * 1000,
            weekly: 7 * 24 * 60 * 60 * 1000
		};
        
        try {
            await registration.periodicSync.register('wts-periodic-sync', {
                minInterval: intervals[syncInterval]
			});
            console.log('Periodic Sync registered');
			} catch (e) {
            console.error('Periodic Sync registration failed:', e);
		}
	}
	
    // Trigger manual sync
    function triggerSync() {
        if (!('serviceWorker' in navigator)) return;
        
        navigator.serviceWorker.ready.then(registration => {
            if ('sync' in registration) {
                registration.sync.register('wts-data-sync');
				} else {
                // Fallback for browsers without Background Sync
                checkForUpdates();
			}
		});
	}
	
    // Initialize sync settings
    loadSyncSettings();
    
    // Initialize settings
    loadUpdateSettings();
	
	// Initialize notification toggle
	updateNotificationToggle();
});

// Update check function with notification check
function checkForUpdates() {
    if (!notificationsEnabled) {
        console.log('Skipping update check: notifications disabled');
        return;
	}
    
    console.log('Checking for updates...');
    fetch('/version.json')
	.then(response => response.json())
	.then(data => {
		const currentVersion = '1.19';
		const latestVersion = data.version;
		
		if (currentVersion !== latestVersion) {
			showUpdateNotification(latestVersion);
		}
	})
	.catch(console.error);
}

// Show update notification
function showUpdateNotification(version) {
    if (!notificationsEnabled) return;
    
    const title = 'New Version Available!';
    const body = `Version ${version} is now available. Click to update.`;
    
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: '/assets/icons/icon-192.png',
                badge: '/assets/icons/icon-72.png',
                vibrate: [200, 100, 200],
                data: { url: window.location.href }
			});
		});
        } else {
        // Fallback to regular notifications
        new Notification(title, { body, icon: '/assets/icons/icon-192.png' });
	}
}

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});