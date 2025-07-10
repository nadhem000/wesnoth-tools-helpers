/**
	* Documentation Page Script
	* @file Script for documentation page
	* @version 1.1
*/
function updateActiveSection() {
    // Remove all active classes first
    document.querySelectorAll('.wts-doc-content section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Check if hash exists and is valid
    let targetSection = null;
    if (window.location.hash) {
        try {
            targetSection = document.querySelector(window.location.hash);
        } catch (e) {
            console.error('Invalid selector:', window.location.hash);
        }
    }
    
    // Show target section or introduction
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        document.getElementById('introduction')?.classList.add('active');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    // Tooltip initialization
    /* document.querySelectorAll('.wts-doc-tooltip').forEach(el => {
		const key = el.getAttribute('data-i18n');
		el.title = i18n.t(key) || 'Documentation Tooltip';
	}); */
    
    // Page-specific initialization
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.title && el.classList.contains('wts-doc-tooltip')) {
            el.title = el.getAttribute('data-i18n');
		}
	});
	// Set active page in navigation
	document.getElementById('wts-doc-documentation').classList.add('active');
	
	// Navigation handlers
	document.getElementById('wts-doc-dashboard').addEventListener('click', () => {
		window.location.href = '../index.html';
	});
	document.getElementById('wts-doc-tools').addEventListener('click', () => {
		window.location.href = '../ressources/sample.html';
	});
	
	// handle display
    const style = document.createElement('style');
    style.textContent = `
        .wts-doc-content section {
            display: none;
        }
        .wts-doc-content section.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    
    // Update section visibility on hash change
    window.addEventListener('hashchange', updateActiveSection);
    
    // Modify the smooth scrolling function
    document.querySelectorAll('.wts-doc-sidebar a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            window.history.pushState(null, null, href);
            updateActiveSection(); // Add this line
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    // Initialize section visibility
    updateActiveSection();
	
});