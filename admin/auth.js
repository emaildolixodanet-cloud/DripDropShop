// ==============================
// DRIPDROP ADMIN AUTH (FINAL)
// ==============================

// ⚠️ Endpoint Apps Script (SEM /u/, SEM headers)
const AUTH_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxmJbi24_yxLVg3geVwKtEejUxReslME_NpV7X3pjreh7KpnB5NKlitD7EGq4PHRb_z/exec";

const STORAGE_KEY = "dripdrop_admin_token";

// ==============================
// LOGIN
// ==============================
export function setupLogin() {
  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCode");
  const error = document.getElementById("loginError");

  if (!form || !input) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (error) error.style.display = "none";

    try {
      // ⚠️ FORM POST (application/x-www-form-urlencoded)
      const body = new URLSearchParams();
      body.append("code", input.value.trim());

      const res = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        body
      });

      const data = await res.json();

      if (!data.ok || !data.token) {
        if (error) {
          error.textContent = "Código inválido";
          error.style.display = "block";
        }
        return;
      }

      // Guardar token e entrar
      localStorage.setItem(STORAGE_KEY, data.token);
      window.location.href = "./index.html";

    } catch (err) {
      if (error) {
        error.textContent = "Erro de ligação";
        error.style.display = "block";
      }
    }
  });
}

// ==============================
// PROTEÇÃO DAS PÁGINAS ADMIN
// ==============================
export async function protectPage() {
  const token = localStorage.getItem(STORAGE_KEY);

  if (!token) {
    window.location.replace("./login.html");
    return;
  }

  try {
    const res = await fetch(`${AUTH_ENDPOINT}?token=${encodeURIComponent(token)}`);
    const data = await res.json();

    if (!data.ok) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.replace("./login.html");
    }

  } catch {
    localStorage.removeItem(STORAGE_KEY);
    window.location.replace("./login.html");
  }
}

// ==============================
// LOGOUT (opcional)
// ==============================
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.replace("./login.html");
}
