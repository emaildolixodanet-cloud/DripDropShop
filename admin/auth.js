// AUTH VIA APPS SCRIPT — FINAL E MINIMAL

const AUTH_ENDPOINT = "https://script.google.com/macros/s/AKfycbwtpepmYjiw1zVHtpe_vn5zA2sWHbKCT0oYAY6B5guaVX3oQNSFOKcouGrJ6abwQaUx/exec";
const STORAGE_KEY = "dripdrop_admin_token";

// LOGIN
export function setupLogin() {
  console.log("AUTH: setupLogin");

  const form = document.getElementById("loginForm");
  const input = document.getElementById("accessCode");
  const error = document.getElementById("loginError");

  if (!form || !input) {
    console.error("AUTH: missing elements");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("AUTH: submit");

    error.style.display = "none";

    const res = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: input.value.trim() })
    });

    const data = await res.json();
    console.log("AUTH: response", data);

    if (!data.ok) {
      error.textContent = "Código inválido";
      error.style.display = "block";
      return;
    }

    localStorage.setItem(STORAGE_KEY, data.token);
    window.location.href = "./index.html";
  });
}

// PROTEÇÃO
export function protectPage() {
  const token = localStorage.getItem(STORAGE_KEY);

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  fetch(`${AUTH_ENDPOINT}?token=${token}`)
    .then(r => r.json())
    .then(data => {
      if (!data.ok) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.href = "./login.html";
      }
    })
    .catch(() => {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = "./login.html";
    });
}
