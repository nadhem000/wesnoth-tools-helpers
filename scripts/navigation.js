/**
 * Navigation Controller
 * Handles page navigation and template loading
 * @version 1.0
 */
/*  */
/* // Initialize navigation
document.addEventListener('DOMContentLoaded', () => {
    loadTemplates();
    setupNavigation();
    setupActivePage();
});

// Load header and footer templates
function loadTemplates() {
    // Calculate base path based on current directory
    const basePath = window.location.pathname.includes('ressources') ? '..' : '.';
    
    // Use XMLHttpRequest instead of fetch to avoid CORS issues with file://
    loadTemplate('header-container', `${basePath}/templates/header.html`);
    loadTemplate('footer-container', `${basePath}/templates/footer.html`);
}

// Load template into container
function loadTemplate(containerId, templatePath) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', templatePath, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = xhr.responseText;
                    
                    // Fix navigation links in header
                    if (containerId === 'header-container') {
                        const basePath = window.location.pathname.includes('ressources') ? '..' : '.';
                        document.querySelectorAll('.wts-index-dropdown-content a').forEach(link => {
                            const href = link.getAttribute('href');
                            if (href && !href.startsWith('http')) {
                                link.setAttribute('href', `${basePath}/${href}`);
                            }
                        });
                    }
                    
                    // Setup header elements after load
                    setupHeaderEventListeners();
                    setupActivePage();
                    i18n.setLanguage(i18n.currentLang);
                }
            } else {
                console.error(`Error loading template: ${templatePath}`, xhr.statusText);
            }
        }
    };
    xhr.send(null);
}

// Setup navigation event listeners
function setupNavigation() {
    // Dashboard navigation
    document.addEventListener('click', (e) => {
        if (e.target.closest('#wts-index-dashboard')) {
            window.location.href = '../index.html';
        }
        // Tools dropdown navigation
        else if (e.target.closest('#wts-index-tools')) {
            document.querySelector('.wts-index-dropdown-content').classList.toggle('show');
        }
        // Documentation navigation
        else if (e.target.closest('#wts-index-documentation')) {
            window.location.href = '../ressources/documentation.html';
        }
    });
    
    // Language selection
    document.addEventListener('click', (e) => {
        const langLink = e.target.closest('.wts-index-dropdown-content a[data-lang]');
        if (langLink) {
            e.preventDefault();
            i18n.setLanguage(langLink.dataset.lang);
        }
    });
}

// Set active page indicator
function setupActivePage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.wts-index-nav button, .wts-index-dropdown-content a');
    
    // Clear existing active classes
    navItems.forEach(item => item.classList.remove('active'));
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (!href) return;
        
        const itemPage = href.split('/').pop();
        if (itemPage === currentPage) {
            item.classList.add('active');
            // Also activate tools button if in tools section
            if (item.closest('.wts-index-dropdown-content')) {
                document.getElementById('wts-index-tools')?.classList.add('active');
            }
        }
    });
}

// Setup header-specific event listeners
function setupHeaderEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('wts-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.hasAttribute('data-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('wts-theme', newTheme);
            document.documentElement.toggleAttribute('data-theme', newTheme === 'dark');
            // Update tooltip
            themeToggle.title = newTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.wts-index-dropdown')) {
            document.querySelectorAll('.wts-index-dropdown-content').forEach(
                dropdown => dropdown.classList.remove('show')
            );
        }
    });
} */