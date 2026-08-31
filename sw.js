self.addEventListener('install', (e) => {
  console.log('[Service Worker] Instalado');
});

self.addEventListener('fetch', (e) => {
  // Obligatorio para que Chrome detecte la PWA como funcional offline
});