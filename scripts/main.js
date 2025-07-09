
i18n.init();
/** 
	* Main JavaScript for Index Page 
	* @file Handles core functionality for the main dashboard 
	* @version 1.1 
*/ 

// DOM Ready Handler 
document.addEventListener('DOMContentLoaded', () => { 
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
    } else { 
        document.documentElement.removeAttribute('data-theme'); 
    } 
    localStorage.setItem('wts-theme', theme); 
    
    // Define path data for both themes
    const newPath = theme === 'dark' ? 
        "M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" : 
        "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z";

    // Get SVG path element
    const path = themeIcon.querySelector('path');
    
    if (path) {
        path.setAttribute('d', newPath);
    } else {
        themeIcon.innerHTML = `<path d="${newPath}"/>`;
    }
    
    // Update tooltip 
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
    // Navigation handlers
    document.getElementById('wts-index-tools').addEventListener('click', () => {
        window.location.href = 'ressources/documentation.html';
	});
    
    // Documentation button
    document.getElementById('wts-index-documentation').addEventListener('click', () => {
        window.location.href = 'ressources/documentation.html';
	});
	
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
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
	const protocol = window.location.protocol;
	const swPath = protocol === 'file:' ? 'sw.js' : '/sw.js';
	
	window.addEventListener('load', () => {
		navigator.serviceWorker.register(swPath)
		.then(reg => console.log('SW registered: ', reg))
		.catch(err => console.log('SW registration failed: ', err));
	});
}