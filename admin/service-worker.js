// NÃO CACHEAR AUTH
const AUTH_URLS = [
  "/admin/login.html",
  "/admin/auth.js",
  "/admin/index.html"
];

self.addEventListener("fetch", (event) => {
  if (AUTH_URLS.some(url => event.request.url.includes(url))) {
    return; // deixa ir à rede
  }
});
