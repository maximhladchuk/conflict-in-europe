// Internationalization module
import { translations } from './translations.js';

// Get current language from localStorage or default to 'uk'
let currentLang = localStorage.getItem('language') || 'uk';

// Function to get nested translation
function getTranslation(key, lang = currentLang) {
  if (!translations || !translations[lang]) {
    return key;
  }
  
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return value || key;
}

// Function to apply translations
function applyTranslations(lang = currentLang) {
  // Translate text content
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key, lang);
    element.textContent = translation;
  });
  
  // Translate alt attributes
  document.querySelectorAll('[data-i18n-alt]').forEach(element => {
    const key = element.getAttribute('data-i18n-alt');
    const translation = getTranslation(key, lang);
    element.setAttribute('alt', translation);
  });
  
  // Translate title attributes
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    const translation = getTranslation(key, lang);
    element.setAttribute('title', translation);
  });
  
  // Translate aria-label attributes
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    const translation = getTranslation(key, lang);
    element.setAttribute('aria-label', translation);
  });
  
  // Update document language
  document.documentElement.lang = lang;
  
  // Save language preference
  localStorage.setItem('language', lang);
  currentLang = lang;
}

// Language switching functionality
function initLanguageSwitching() {
  document.querySelectorAll('.lang button').forEach(btn => {
    btn.addEventListener('click', () => {
      const newLang = btn.getAttribute('data-lang');
      
      // Update button states
      document.querySelectorAll('.lang button').forEach(button => {
        const isActive = button.getAttribute('data-lang') === newLang;
        button.setAttribute('aria-pressed', String(isActive));
      });
      
      // Apply translations
      applyTranslations(newLang);
      
      // Re-render servers if they exist
      if (window.renderServers) {
        window.renderServers();
      }
    });
  });
}

// Update currentLang getter to always return current value
function getCurrentLang() {
  return currentLang;
}

export { 
  getCurrentLang,
  getTranslation, 
  applyTranslations, 
  initLanguageSwitching 
};
