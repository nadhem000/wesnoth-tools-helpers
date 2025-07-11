/**
 * About Page Script
 * @file Handles functionality for the About page
 * @version 1.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // Set active page in navigation
    document.getElementById('wts-index-about')?.classList.add('active');
    
    // Navigation handlers
    setupNavigation();
    
    // Add any About page specific functionality here
    console.log('About page loaded');
});

function setupNavigation() {
    // Dashboard button
    document.getElementById('wts-index-dashboard')?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });

    // Documentation button
    document.getElementById('wts-index-documentation')?.addEventListener('click', () => {
        window.location.href = 'documentation.html';
    });
}