// =====================
// AUTH VIA APPS SCRIPT
// =====================

const AUTH_ENDPOINT = "https://script.google.com/macros/s/AKfycbwtpepmYjiw1zVHtpe_vn5zA2sWHbKCT0oYAY6B5guaVX3oQNSFOKcouGrJ6abwQaUx/exec";
const STORAGE_KEY = "dripdrop_admin_token";

// ---------- LOGIN ----------
export function setupLogin() {
  console.log("[AUTH] setupLogin loaded");

  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCode");
  const error = document.getElementById("loginError");

  if (!form || !input) {
    console.error("[AUTH] form or input not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("[AUTH] submit intercepted");

    error.style.display = "none";

    try {
      const res = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input.value.trim() })
      });

      const data = await res.json();
      console.log("[AUTH] response", data);

      if (!data.ok) {
        error.textContent = "Código inválido";
        error.style.display = "block";
        return;
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      window.location.href = "./index.html";

    } catch (err) {
      console.error("[AUTH] fetch error", err);
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
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = "./login.html";
  }
}
