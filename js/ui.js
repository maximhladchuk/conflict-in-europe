// UI module for modals, copying, and mobile menu
import { getTranslation } from './i18n.js';

// Copy functionality
function attachCopyFunctionality() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    if (!btn.hasAttribute('data-copy-attached')) {
      btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(getTranslation('toast.copied'));
        });
      });
      btn.setAttribute('data-copy-attached', 'true');
    }
  });
}

// Toast notifications
function showToast(message) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => toast.classList.add('show'), 100);
  
  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Mobile burger menu
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileMenu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

// QR Modal functionality
function initQRModals() {
  const modal = document.getElementById('qr-modal');
  const modalImg = document.getElementById('qr-modal-img');
  const closeBtn = document.querySelector('.modal-close');

  // QR button click handlers
  document.querySelectorAll('[data-qr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const qrType = btn.getAttribute('data-qr');
      let imgSrc = '';
      
      switch(qrType) {
        case 'patreon':
          imgSrc = 'assets/qr-patreon.png';
          break;
        case 'bep20':
          imgSrc = 'assets/qr-bep.png';
          break;
        case 'trc20':
          imgSrc = 'assets/qr-trc.png';
          break;
        case 'privat24':
          imgSrc = 'assets/qrp24.png';
          break;
      }
      
      if (imgSrc) {
        modalImg.src = imgSrc;
        modal.style.display = 'flex';
        // Focus trap
        closeBtn.focus();
      }
    });
  });

  // Close modal handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Close on outside click
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Initialize all UI components
function initUI() {
  initMobileMenu();
  initQRModals();
  initSmoothScrolling();
  attachCopyFunctionality();
}

export { 
  initUI, 
  attachCopyFunctionality, 
  showToast 
};
