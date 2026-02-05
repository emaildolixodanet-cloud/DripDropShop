import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 🔒 Emails autorizados (sempre em minúsculas)
const ALLOWED_EMAILS = [
  "emaildolixodanet@gmail.com",
  "joaoloureirorios@gmail.com"
];

// Inicialização Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ------------------------
// LOGIN (admin/login.html)
// ------------------------
export function setupLogin() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.onclick = async () => {
      await signInWithRedirect(auth, provider);
    };
  }

  // Trata o retorno do Google (iOS / PWA)
  getRedirectResult(auth).catch(() => {});
}

// ------------------------
// PROTEÇÃO (admin/index.html)
// ------------------------
export function protectPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "./login.html";
        return;
      }

      const email = (user.email || "").toLowerCase();

      if (!ALLOWED_EMAILS.includes(email)) {
        await signOut(auth);
        window.location.href = "./no-access.html";
        return;
      }

      resolve(user);
    });
  });
}
