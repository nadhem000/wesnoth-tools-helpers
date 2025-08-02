/**
	* Main JavaScript for Index Page 
	* @file Handles core functionality for the main dashboard 
	* @version 1.3 
*/

// --- PATH UTILITIES ---
function normalizePath(path) {
    return (!path.includes('.') && !path.endsWith('/')) 
	? path + '.html'
	: path;
}

// --- NAVIGATION HANDLERS ---
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
            link.addEventListener('click', e => {
                e.preventDefault();
                let href = normalizePath(link.getAttribute('href'));
                
                if (isInRessources) {
                    href = isLocalFile 
					? href.replace('ressources/', '') 
					: `/${href}`;
					} else {
                    href = isLocalFile ? href : `/${href}`;
				}
                
                window.location.href = href;
			});
		});
		
        // Documentation button
        document.getElementById('wts-index-documentation')?.addEventListener('click', () => {
            const path = isInRessources ? 'documentation.html' : 'ressources/documentation.html';
            window.location.href = isLocalFile ? path : `/${path}`;
		});
		
        // About button
        document.getElementById('wts-index-about')?.addEventListener('click', () => {
            const path = isInRessources ? 'about.html' : 'ressources/about.html';
            window.location.href = isLocalFile ? path : `/${path}`;
		});
		} catch (e) {
        console.warn('Navigation setup failure', e);
	}
}

// --- SERVICE WORKER REGISTRATION ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const isLocalFile = window.location.protocol === 'file:';
        const isInRessources = window.location.pathname.includes('ressources');
        const swPath = isLocalFile 
		? (isInRessources ? '../sw.js' : 'sw.js')
		: '/sw.js';
		
        navigator.serviceWorker.register(swPath)
		.then(reg => console.log('SW registered: ', reg))
		.catch(err => console.log('SW registration failed: ', err));
	});
}

// --- THEME MANAGEMENT ---
function setTheme(theme) {
    const themeToggle = document.getElementById('wts-theme-toggle');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/></svg>`;
		} else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"/></svg>`;
	}
    
    localStorage.setItem('wts-theme', theme);
    themeToggle.title = theme === 'light' 
	? 'Switch to dark mode' 
	: 'Switch to light mode';
}

// --- SETTINGS MANAGEMENT ---
function handleCacheClear() {
    try {
        const keysToKeep = Array.from(localStorage)
		.filter(([key]) => !key.startsWith('wts-') && !key.startsWith('wts-lang'))
		.map(([key]) => key);
		
        localStorage.clear();
        keysToKeep.forEach(key => localStorage.setItem(key, localStorage.getItem(key)));
		
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('wts-') || cacheName.includes('wesnoth-tools')) {
                        caches.delete(cacheName);
					}
				});
			});
		}
        alert(i18n.t('settings.cache_cleared') || 'WTS cache cleared successfully!');
		} catch (e) {
        console.error('Cache clearing failed:', e);
        alert(i18n.t('settings.cache_error') || 'Error clearing WTS cache.');
	}
}

function handleSettingsReset() {
    if (confirm(i18n.t('settings.reset_confirm') || 'Reset all WTS settings?')) {
        // Clear all settings
        localStorage.removeItem('wts-theme');
        localStorage.removeItem('wts-lang');
        localStorage.removeItem('wts-notifications');
        localStorage.removeItem('wts-sync-bcg-method');
        localStorage.removeItem('wts-sync-perio-method');
        localStorage.removeItem('wts-sync-perio-interval');
        
        document.documentElement.removeAttribute('data-theme');
        alert(i18n.t('settings.reset_success') || 'Settings reset. Reloading...');
        setTimeout(() => location.reload(), 1000);
	}
}

function exportSettings() {
    try {
        const settings = {
            theme: localStorage.getItem('wts-theme') || 'light',
            language: localStorage.getItem('wts-lang') || 'en',
            notifications: localStorage.getItem('wts-notifications') || 'false',
            syncBcgMethod: localStorage.getItem('wts-sync-bcg-method') || 'manual',
            syncPerioMethod: localStorage.getItem('wts-sync-perio-method') || 'manual',
            syncPerioInterval: localStorage.getItem('wts-sync-perio-interval') || '60'
		};
        
        const dataStr = "data:text/json;charset=utf-8," + 
		encodeURIComponent(JSON.stringify(settings));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "wts-settings.json");
        dlAnchorElem.click();
        
        alert(i18n.t('settings.export_success') || 'Settings exported!');
		} catch (e) {
        console.error('Export error:', e);
        alert(i18n.t('settings.export_error') || 'Export failed.');
	}
}

function importSettings() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const reader = new FileReader();
            reader.onload = e => {
                try {
					const settings = JSON.parse(e.target.result);
					// Set all settings including new ones
					if (settings.theme) {
						localStorage.setItem('wts-theme', settings.theme);
						setTheme(settings.theme);
					}
					if (settings.language) {
						localStorage.setItem('wts-lang', settings.language);
						i18n.setLanguage(settings.language);
					}
					if (settings.notifications) {
						localStorage.setItem('wts-notifications', settings.notifications);
					}
					if (settings.syncBcgMethod) {
						localStorage.setItem('wts-sync-bcg-method', settings.syncBcgMethod);
					}
					if (settings.syncPerioMethod) {
						localStorage.setItem('wts-sync-perio-method', settings.syncPerioMethod);
					}
					if (settings.syncPerioInterval) {
						localStorage.setItem('wts-sync-perio-interval', settings.syncPerioInterval);
					}
					
					alert(i18n.t('settings.import_success') || 'Settings imported! Reloading...');
					setTimeout(() => location.reload(), 1000);
					} catch (parseError) {
                    console.error('Invalid file:', parseError);
                    alert(i18n.t('settings.import_error') || 'Invalid settings file.');
				}
			};
            reader.readAsText(e.target.files[0]);
		};
        input.click();
		} catch (e) {
        console.error('Import failed:', e);
        alert(i18n.t('settings.import_error') || 'Import failed.');
	}
}

// --- MODAL MANAGEMENT ---
function setupModal() {
    const modal = document.getElementById('wts-settings-modal');
    const btn = document.getElementById('wts-index-settings');
    const closeBtn = document.querySelector('.wts-modal-close');
	
    function openModal() {
        modal.style.display = "block";
        setTimeout(() => modal.classList.add('show'), 10);
	}
	
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = "none", 300);
	}
	
    btn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => e.target === modal && closeModal());
	
    // Tab switching
    document.querySelectorAll('.wts-modal-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.wts-modal-tab, .wts-modal-tab-content')
			.forEach(el => el.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`wts-tab-${tab.dataset.tab}`).classList.add('active');
		});
	});
}

// --- SYNC SETTINGS ---
function setupSyncSettings() {
    // Network Sync
    const bcgMethod = document.getElementById('wts-sync-bcg-method');
    bcgMethod.value = localStorage.getItem('wts-sync-bcg-method') || 'manual';
    
    // Periodic Sync
    const perioMethod = document.getElementById('wts-sync-perio-method');
    const perioInterval = document.getElementById('wts-sync-perio-interval');
    const intervalContainer = document.getElementById('wts-sync-perio-interval-container');
    
    perioMethod.value = localStorage.getItem('wts-sync-perio-method') || 'manual';
    perioInterval.value = localStorage.getItem('wts-sync-perio-interval') || '60';
    intervalContainer.style.display = perioMethod.value === 'auto' ? 'block' : 'none';
	
    // Event handlers
    bcgMethod.addEventListener('change', () => {
        localStorage.setItem('wts-sync-bcg-method', bcgMethod.value);
	});
    
    perioMethod.addEventListener('change', () => {
        localStorage.setItem('wts-sync-perio-method', perioMethod.value);
        intervalContainer.style.display = perioMethod.value === 'auto' ? 'block' : 'none';
	});
    
    perioInterval.addEventListener('change', () => {
        localStorage.setItem('wts-sync-perio-interval', perioInterval.value);
	});
}


// --- NOTIFICATIONS SETTINGS ---
function checkForVersionUpdates() {
  try {
    const notifyEnabled = localStorage.getItem('wts-version-notifications') === 'true';
    const pushEnabled = localStorage.getItem('wts-notifications') === 'true';
    
    if (!notifyEnabled) return;

    const currentVersion = "1.22"; // Should match manifest version
    const lastNotifiedVersion = localStorage.getItem('wts-last-notified-version');
    
    if (lastNotifiedVersion !== currentVersion) {
      showVersionNotification(currentVersion);
      
      // Trigger push notification if enabled
      if (pushEnabled && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'VERSION_UPDATE',
          version: currentVersion
        });
      }
      
      localStorage.setItem('wts-last-notified-version', currentVersion);
    }
  } catch (e) {
    console.error('Version check failed:', e);
  }
}

function showVersionNotification(version) {
	try {
		const toast = document.getElementById('wts-version-toast');
		const message = document.getElementById('wts-version-message');
		
		message.textContent = i18n.t('settings.new_version_available', { version }) || 
		`New version ${version} is available!`;
		
		toast.style.display = 'flex';
		
		// Add close button functionality
		document.querySelector('.wts-version-toast-close').onclick = () => {
			toast.style.display = 'none';
		};
		
		// Auto-hide after 10 seconds
		setTimeout(() => {
			toast.style.display = 'none';
		}, 10000);
		} catch (e) {
		console.error('Failed to show version notification:', e);
	}
}
function requestNotificationPermission() {
  Notification.requestPermission().then(permission => {
    if (permission !== 'granted') {
      document.getElementById('wts-notifications-toggle').checked = false;
      localStorage.setItem('wts-notifications', 'false');
    }
  });
}
// --- DOM INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Tooltips
    document.querySelectorAll('.wts-index-tooltip').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.title = i18n.t(key) || 'Tooltip';
		}
	});
	
    // Theme initialization
    const savedTheme = localStorage.getItem('wts-theme') || 'light';
    setTheme(savedTheme);
    
    document.getElementById('wts-theme-toggle').addEventListener('click', () => {
        const newTheme = document.documentElement.hasAttribute('data-theme') 
		? 'light' 
		: 'dark';
        setTheme(newTheme);
	});
	
    // Offline detection
    if (!navigator.onLine) {
        const offlineMsg = document.createElement('p');
        offlineMsg.className = 'wts-index-offline';
        offlineMsg.textContent = i18n.t('offline.message') || 'Offline Mode';
        document.querySelector('.wts-index-footer').appendChild(offlineMsg);
	}
	
	// PWA Installation
	let deferredPrompt;
	window.addEventListener('beforeinstallprompt', e => {
		e.preventDefault();
		deferredPrompt = e;
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) {
			installBtn.style.display = 'block';
		}
	});
	
	window.addEventListener('appinstalled', () => {
		const installBtn = document.getElementById('wts-install-btn');
		if (installBtn) {
			installBtn.style.display = 'none';
		}
	});
	
    // Language selection
    document.querySelectorAll('.wts-index-dropdown-content a[data-lang]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            i18n.setLanguage(link.dataset.lang);
		});
	});
	
    // Settings modal
    setupModal();
    setupSyncSettings();
	
    // Notification toggle
    const notifToggle = document.getElementById('wts-notifications-toggle');
    notifToggle.checked = localStorage.getItem('wts-notifications') === 'true';
    notifToggle.addEventListener('change', () => {
        localStorage.setItem('wts-notifications', notifToggle.checked);
	});
	
	// Initialize version notification toggle
	const versionNotifToggle = document.getElementById('wts-version-notifications-toggle');
	versionNotifToggle.checked = localStorage.getItem('wts-version-notifications') === 'true';
	versionNotifToggle.addEventListener('change', () => {
		localStorage.setItem('wts-version-notifications', versionNotifToggle.checked);
	});
	
	// Check for version updates
	setTimeout(checkForVersionUpdates, 3000);
	
	document.getElementById('wts-notifications-toggle')?.addEventListener('change', function() {
		if (this.checked && Notification.permission !== 'granted') {
			requestNotificationPermission();
		}
	});
    // Settings actions
    document.getElementById('wts-modal-clear-cache')?.addEventListener('click', handleCacheClear);
    document.getElementById('wts-modal-reset-settings')?.addEventListener('click', handleSettingsReset);
    document.getElementById('wts-modal-export-settings')?.addEventListener('click', exportSettings);
    document.getElementById('wts-modal-import-settings')?.addEventListener('click', importSettings);
	
    // Navigation
    setupNavigation();
});