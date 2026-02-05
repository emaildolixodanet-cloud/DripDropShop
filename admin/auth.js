// =====================
// AUTH VIA APPS SCRIPT
// =====================

// 🔐 Endpoint seguro (Apps Script)
const AUTH_ENDPOINT = "https://script.google.com/macros/s/AKfycbyPPs6zo0q7bisQUjwQJoexCbuFpCXYepCFmjy26YpHWZERpOe03A4DC2aikxK9hH3N/exec";

// Storage do token
const STORAGE_KEY = "dripdrop_admin_token";

// ---------- LOGIN ----------
export async function setupLogin() {
  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCode");
  const error = document.getElementById("loginError");

  if (!form || !input) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    error.style.display = "none";

    try {
      const res = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.value })
      });

      const data = await res.json();

      if (!data.ok) {
        error.textContent = "Código inválido";
        error.style.display = "block";
        return;
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      window.location.href = "./index.html";

    } catch {
      error.textContent = "Erro de ligação";
      error.style.display = "block";
    }
  });
}

// ---------- PROTEÇÃO ----------
export async function protectPage() {
  const token = localStorage.getItem(STORAGE_KEY);

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const res = await fetch(`${AUTH_ENDPOINT}?token=${token}`);
    const data = await res.json();

    if (!data.ok) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "./login.html";
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "./login.html";
  }
}
