const CACHE_NAME = "dripdrop-control-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Não cachear pedidos ao Firebase / Google
  if (event.request.url.includes("googleapis") || event.request.url.includes("firebase")) {
    return;
  }
});
