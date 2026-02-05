// ==============================
// DRIPDROP ADMIN AUTH (LOCAL CODE)
// ==============================
//
// ✅ Works on GitHub Pages + iOS (Safari/PWA) — no CORS, no backend.
// 🔐 Change the secret code below when you want.
//
// NOTE: This is NOT "hacker-proof" (static sites never are). It blocks 99% of people.

const SECRET_CODE = "Dr1pDr0p.2026"; // <-- MUDA AQUI
const KEY = "dd_admin_auth_v1";

function show(el, on) {
  if (!el) return;
  el.style.display = on ? "block" : "none";
}

export function isAuthed() {
  return localStorage.getItem(KEY) === "1";
}

export function logout(redirect = "login.html") {
  localStorage.removeItem(KEY);
  window.location.replace(redirect);
}

// ---------- LOGIN (login.html) ----------
export function setupLogin(options = {}) {
  const redirect = options.redirect || "index.html";

  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCode");
  const error = document.getElementById("loginError");

  if (isAuthed()) {
    window.location.replace(redirect);
    return;
  }

  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const code = (input.value || "").trim();

    if (code === SECRET_CODE) {
      localStorage.setItem(KEY, "1");
      // tiny delay helps Safari/PWA settle state
      setTimeout(() => window.location.replace(redirect), 30);
    } else {
      if (error) error.textContent = "Código inválido";
      show(error, true);
    }
  });
}

// ---------- PROTECTION (index.html) ----------
export function protectPage(options = {}) {
  const login = options.login || "login.html";

  if (!isAuthed()) {
    window.location.replace(login);
  }
}
