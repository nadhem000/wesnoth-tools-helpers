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
});