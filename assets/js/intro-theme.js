import('./theme.js')
  .then(({ bindThemeToggle }) => bindThemeToggle(document.getElementById('introThemeToggle')))
  .catch((error) => console.error('Tema halaman tidak dapat diinisialisasi:', error));
