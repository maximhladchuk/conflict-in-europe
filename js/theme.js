// Theme management module

// Get current theme from localStorage or default to 'light'
let currentTheme = localStorage.getItem('theme') || 'light';

// Function to apply theme
function applyTheme(theme = currentTheme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Save theme preference
  localStorage.setItem('theme', theme);
  currentTheme = theme;
  
  // Update theme buttons state
  document.querySelectorAll('.theme button').forEach(btn => {
    const isActive = btn.getAttribute('data-theme') === theme;
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

// Initialize theme switching
function initThemeSwitching() {
  document.querySelectorAll('.theme button').forEach(btn => {
    btn.addEventListener('click', () => {
      const newTheme = btn.getAttribute('data-theme');
      applyTheme(newTheme);
    });
  });
}

export { 
  currentTheme, 
  applyTheme, 
  initThemeSwitching 
};
