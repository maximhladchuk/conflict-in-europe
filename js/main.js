// Main application entry point
import { getCurrentLang, applyTranslations, initLanguageSwitching } from './i18n.js';
import { currentTheme, applyTheme, initThemeSwitching } from './theme.js';
import { loadServers, renderServers, startServerRefresh, initMapModal } from './servers.js';
import { initUI } from './ui.js';

// Make renderServers globally available for i18n module
window.renderServers = renderServers;
window.attachCopyFunctionality = () => {
  import('./ui.js').then(module => module.attachCopyFunctionality());
};

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set initial button state based on current language
  document.querySelectorAll('.lang button').forEach(btn => {
    const isActive = btn.getAttribute('data-lang') === getCurrentLang();
    btn.setAttribute('aria-pressed', String(isActive));
  });
  
  // Set initial button state based on current theme
  document.querySelectorAll('.theme button').forEach(btn => {
    const isActive = btn.getAttribute('data-theme') === currentTheme;
    btn.setAttribute('aria-pressed', String(isActive));
  });
  
  // Apply initial theme and translations
  applyTheme(currentTheme);
  applyTranslations(getCurrentLang());
  
  // Initialize UI components
  initUI();
  
  // Initialize map modal
  initMapModal();
  
  // Initialize language and theme switching
  initLanguageSwitching();
  initThemeSwitching();
  
  // Load servers data
  loadServers();
  
  // Start auto-refresh for servers
  startServerRefresh();
  
  // Re-render servers after translations are applied
  setTimeout(() => {
    if (window.serversData && window.serversData.length > 0) {
      renderServers();
    }
  }, 100);
});

// Year in footer
const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
