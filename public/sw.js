// Minimal service worker to make the app installable
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Optional: passthrough fetch (no caching by default)
self.addEventListener('fetch', () => {});