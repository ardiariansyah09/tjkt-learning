const THEME_KEY = 'tjkt-theme';
const LEGACY_TOPOLOGY_THEME_KEY = 'tjkt:topology:theme';

function readTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;

    const legacyTheme = localStorage.getItem(LEGACY_TOPOLOGY_THEME_KEY);
    if (legacyTheme === 'dark' || legacyTheme === 'light') {
      localStorage.setItem(THEME_KEY, legacyTheme);
      localStorage.removeItem(LEGACY_TOPOLOGY_THEME_KEY);
      return legacyTheme;
    }
  } catch (error) {
    console.warn('Preferensi tema tidak dapat dibaca:', error);
  }

  return 'light';
}

function updateButton(button, isDark) {
  const icon = isDark ? '☀️' : '🌙';
  button.setAttribute('aria-pressed', String(isDark));
  button.setAttribute(
    'aria-label',
    isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'
  );
  button.title = isDark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap';

  if (button.id === 'themeToggle') {
    button.textContent = `${icon} Ganti Tema`;
  } else {
    button.textContent = icon;
  }
}

export function bindThemeToggle(button) {
  if (!button) return;

  const applyTheme = (isDark) => {
    document.body.classList.toggle('dark', isDark);
    updateButton(button, isDark);
  };

  applyTheme(readTheme() === 'dark');
  button.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    applyTheme(isDark);

    try {
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      localStorage.removeItem(LEGACY_TOPOLOGY_THEME_KEY);
    } catch (error) {
      console.warn('Preferensi tema tidak dapat disimpan:', error);
    }
  });
}
