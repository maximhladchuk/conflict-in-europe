// Mobile burger
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
}

// Copy-to-clipboard for support cards
const toast = document.getElementById('toast');
function showToast(msg = 'Copied!') {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}
function copyText(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
}
document.querySelectorAll('[data-copy]').forEach(btn => {
  btn.addEventListener('click', () => copyText(btn.getAttribute('data-copy')));
});

// Smooth in-page scrolling
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1 && document.querySelector(id)) {
      e.preventDefault();
      document.querySelector(id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      mobileMenu?.classList.remove('open');
      burger?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Language switch (stub)
document.querySelectorAll('.lang button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    // Тут можна підключити ваш i18n/переклад
  });
});

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();
