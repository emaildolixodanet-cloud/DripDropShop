import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// 🔒 Emails autorizados (sempre em minúsculas)
const ALLOWED_EMAILS = [
  "emaildolixodanet@gmail.com",
  "infodripdropshop@gmail.com",
  "email_da_tua_mulher@gmail.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ------------------------
// LOGIN (admin/login.html)
// ------------------------
export function setupLogin() {
  document.getElementById("loginBtn").onclick = async () => {
    await signInWithPopup(auth, provider);
  };

  onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const email = user.email.toLowerCase();

    if (!ALLOWED_EMAILS.includes(email)) {
      signOut(auth);
      window.location.href = "./no-access.html";
      return;
    }

    // ✅ entra na app interna
    window.location.href = "./index.html";
  });
}

// ------------------------
// PROTEÇÃO (admin/index.html)
// ------------------------
export function protectPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "./login.html";
        return;
      }

      const email = user.email.toLowerCase();

      if (!ALLOWED_EMAILS.includes(email)) {
        signOut(auth);
        window.location.href = "./no-access.html";
        return;
      }

      resolve(user);
    });
  });
}
