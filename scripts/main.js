/** 
	* Main JavaScript for Index Page 
	* @file Handles core functionality for the main dashboard 
	* @version 1.2 
*/ 

// Improved navigation handler
function setupNavigation() {
	try {
		const isInRessources = window.location.pathname.includes('ressources');
		const isLocalFile = window.location.protocol === 'file:';
		
		// Dashboard button
		document.getElementById('wts-index-dashboard')?.addEventListener('click', () => {
			window.location.href = isInRessources 
			? (isLocalFile ? '../index.html' : '/index.html')
			: 'index.html';
		});
		
		// Tools dropdown items
		document.querySelectorAll('.wts-index-dropdown-content a').forEach(link => {
			link.addEventListener('click', (e) => {
				e.preventDefault();
				let href = link.getAttribute('href');
				
				if (isInRessources) {
					// Handle paths for ressources section
					href = isLocalFile 
					? href.replace('ressources/', '') 
					: href.replace('ressources/', '/ressources/');
					} else {
					// Handle paths from root section
					href = isLocalFile ? href : '/' + href;
				}
				
				window.location.href = href;
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

// DOM Ready Handler (rest of code remains the same)
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

// Update toggle button appearance
function updateNotificationToggle() {
    if (notificationsEnabled) {
        notificationToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" fill="currentColor"/></svg>`;
        notificationToggle.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
    } else {
        notificationToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/></svg>`;
        notificationToggle.style.backgroundColor = '';
    }
    notificationToggle.title = notificationsEnabled ? 'Disable notifications' : 'Enable notifications';
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

// Check for updates
function checkForUpdates() {
    if (!notificationsEnabled) return;

    // This would normally fetch from your server
    const currentVersion = '1.10';
    const latestVersion = '1.11';
    
    if (currentVersion !== latestVersion) {
        showUpdateNotification(latestVersion);
    }
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

// Initialize
updateNotificationToggle();
setInterval(checkForUpdates, 24 * 60 * 60 * 1000); // Check daily

// Notification click handler
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
});