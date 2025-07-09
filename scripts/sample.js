/**
 * Sample Page Script
 * @file Script for sample tools page
 * @version 1.1
 */
document.addEventListener('DOMContentLoaded', () => {
    // Tooltip initialization
    document.querySelectorAll('.wts-sample-tooltip').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.title = i18n.t(key) || 'Sample Tooltip';
});
    
    // Page-specific initialization
    document.querySelectorAll('[data-i18n]').forEach(el => {
        if (!el.title && el.classList.contains('wts-sample-tooltip')) {
            el.title = el.getAttribute('data-i18n');
        }
    });
});