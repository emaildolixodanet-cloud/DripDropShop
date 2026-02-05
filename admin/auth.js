import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const ALLOWED_EMAILS = [
  "emaildolixodanet@gmail.com",
  "joaoloureirorios@gmail.com"
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

await setPersistence(auth, browserLocalPersistence);

// ---------- LOGIN ----------
export function setupLogin() {
  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.onclick = async () => {
      sessionStorage.setItem("login_redirect", "1");
      await signInWithRedirect(auth, provider);
    };
  }

  // Resolve o redirect (iOS precisa)
  getRedirectResult(auth).catch(() => {});
}

// ---------- PROTEÇÃO ----------
export function protectPage() {
  return new Promise((resolve) => {
    let resolved = false;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // ⚠️ só redireciona se NÃO vier de um redirect
        if (!sessionStorage.getItem("login_redirect")) {
          window.location.replace("./login.html");
        }
        return;
      }

      // login confirmado → limpar flag
      sessionStorage.removeItem("login_redirect");

      const email = (user.email || "").toLowerCase();

      if (!ALLOWED_EMAILS.includes(email)) {
        await signOut(auth);
        window.location.replace("./no-access.html");
        return;
      }

      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(user);
      }
    });
  });
}
