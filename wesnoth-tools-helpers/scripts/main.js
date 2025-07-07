// Simple animation for tool cards
document.addEventListener('DOMContentLoaded', () => {
if (window.location.protocol === 'file:') {
    document.getElementById('install-btn').style.display = 'none';
}
    // Tool card interactions
    document.querySelectorAll('.dashboard-main-open-tool').forEach(button => {
        button.addEventListener('click', (e) => {
            const moduleName = e.target.closest('.dashboard-main-tool-card').dataset.module;
            window.location.hash = moduleName;
        });
    });
  
  // Back to dashboard button
  document.addEventListener('click', (e) => {
  if (e.target.id === 'return-dashboard') {
    if (window.loader) { // Check if loader exists
      window.loader.showDashboard();
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.querySelector('.dashboard-main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
        });
    }
    
    // Dashboard link
const dashboardLink = document.getElementById('dashboard-link');
if (dashboardLink) {
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.loader) {
      window.loader.showDashboard();
    }
    if (mainNav) mainNav.classList.remove('active');
  });
}
    
    // Language selector
    document.querySelectorAll('.dashboard-main-dropdown-content a[data-lang]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = link.getAttribute('data-lang');
            changeLanguage(lang);
            // Close mobile menu if open
            if (mainNav) mainNav.classList.remove('active');
        });
    });
});

function changeLanguage(lang) {
    // this would load language resources
    console.log(`Changing language to: ${lang}`);
    // For demo purposes, show a message
    alert(`Language changed to ${lang}. Soon, this would load translation resources.`);
    
    // Update UI elements with translations
    const langNames = {
        en: "English",
        es: "Español",
        fr: "Français",
        de: "Deutsch",
        ru: "Русский",
        zh: "中文"
    };
    
    document.querySelector('.dashboard-main-dropdown > a').textContent = `${langNames[lang]} ▾`;
}
  // PWA Install Prompt
  let deferredPrompt;
  const installButton = document.getElementById('install-btn');
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', () => {
        installButton.style.display = 'none';
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted install');
          }
          deferredPrompt = null;
        });
      });
    }
  });
});