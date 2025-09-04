// Language translations
const translations = {
  uk: {
    nav: {
      servers: "Сервери",
      support: "Підтримка",
      rules: "Правила",
      community: "Спільнота"
    },
    hero: {
      eyebrow: "ARMA Reforger",
      title: "Conflict in Europe — Провідні Сервери",
      subtitle: "Приєднуйтесь, воюйте та завойовуйте поле бою з гравцями з усього світу.",
      join_discord: "ПРИЄДНАТИСЯ ДО DISCORD",
      play_now: "ГРАТИ ЗАРАЗ"
    },
    servers: {
      title: "Наші Сервери",
      online: "Онлайн",
      offline: "Офлайн",
      players: "Гравці",
      region: "Регіон",
      join_now: "ПРИЄДНАТИСЯ",
      join_later: "ПРИЄДНАТИСЯ ПІЗНІШЕ"
    },
    support: {
      title: "Підтримайте Нас",
      go_to_patreon: "ПЕРЕЙТИ НА PATREON",
      copy_wallet: "КОПІЮВАТИ ГАМАНЕЦЬ",
      copy_card: "КОПІЮВАТИ НОМЕР КАРТКИ"
    },
    rules: {
      title: "Правила",
      respect: {
        title: "Повага та Чесна Гра",
        content: "Заборонені домагання, расизм та обман. Грайте чесно та поважайте адміністраторів."
      },
      comms: {
        title: "Голосовий Зв'язок",
        content: "Використовуйте внутрішньоігровий VOIP/Discord відповідально. Уникайте спаму в мікрофон та розмов не по темі під час операцій."
      },
      gameplay: {
        title: "Геймплей",
        content: "Слідуйте лідерам місії, заборонено вбивство товаришів по команді, експлуатація багів."
      }
    },
    community: {
      title: "Спільнота",
      discord_text: "Приєднуйтесь до нашого Discord для отримання доступу до вайтлістів, подій, розкладу операцій та підтримки.",
      open_discord: "ВІДКРИТИ DISCORD",
      follow_text: "Стежте за нами на платформах для новин та оновлень.",
      steam: "Група Steam",
      twitter: "Twitter/X",
      youtube: "YouTube"
    },
    footer: {
      copyright: "Conflict in Europe — Неофіційна спільнота ARMA Reforger"
    }
  },
  en: {
    nav: {
      servers: "Servers",
      support: "Support Us",
      rules: "Rules",
      community: "Community"
    },
    hero: {
      eyebrow: "ARMA Reforger",
      title: "Conflict in Europe — Premier Servers",
      subtitle: "Join, fight, and conquer the battlefield with players worldwide.",
      join_discord: "JOIN DISCORD",
      play_now: "PLAY NOW"
    },
    servers: {
      title: "Our Servers",
      online: "Online",
      offline: "Offline",
      players: "Players",
      region: "Region",
      join_now: "JOIN NOW",
      join_later: "JOIN LATER"
    },
    support: {
      title: "Support Us",
      go_to_patreon: "GO TO PATREON",
      copy_wallet: "COPY WALLET",
      copy_card: "COPY CARD NUMBER"
    },
    rules: {
      title: "Rules",
      respect: {
        title: "Respect & Fair Play",
        content: "No harassment, racism, or cheating. Play fair and respect admins."
      },
      comms: {
        title: "Voice & Comms",
        content: "Use in-game VOIP/Discord responsibly. Avoid mic-spam and off-topic during ops."
      },
      gameplay: {
        title: "Gameplay",
        content: "Follow mission leads, no teamkilling, no exploiting bugs or glitches."
      }
    },
    community: {
      title: "Community",
      discord_text: "Join our Discord to get whitelists, events, ops schedule, and support.",
      open_discord: "OPEN DISCORD",
      follow_text: "Follow us on platforms for news and updates.",
      steam: "Steam Group",
      twitter: "Twitter/X",
      youtube: "YouTube"
    },
    footer: {
      copyright: "Conflict in Europe — Unofficial ARMA Reforger community"
    }
  }
};

// Get current language from localStorage or default to 'uk'
let currentLang = localStorage.getItem('language') || 'uk';

// Function to get nested translation
function getTranslation(key, lang = currentLang) {
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
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = getTranslation(key, lang);
    element.textContent = translation;
  });
  
  // Update document language
  document.documentElement.lang = lang;
  
  // Save language preference
  localStorage.setItem('language', lang);
  currentLang = lang;
}

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

// Language switch
document.querySelectorAll('.lang button').forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedLang = btn.getAttribute('data-lang');
    
    // Update button states
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', 'false'));
    btn.setAttribute('aria-pressed', 'true');
    
    // Apply translations
    applyTranslations(selectedLang);
  });
});

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set initial button state based on current language
  document.querySelectorAll('.lang button').forEach(btn => {
    const isActive = btn.getAttribute('data-lang') === currentLang;
    btn.setAttribute('aria-pressed', String(isActive));
  });
  
  // Apply initial translations
  applyTranslations(currentLang);
});

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();
