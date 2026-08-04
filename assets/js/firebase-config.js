// ============================================
// LCP Horizon International — Config Firebase
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDOpm_2nOn-7HbmNBMnV1KgTvHwZKIiFDU",
  authDomain: "lcp-horizon.firebaseapp.com",
  projectId: "lcp-horizon",
  storageBucket: "lcp-horizon.firebasestorage.app",
  messagingSenderId: "880634786318",
  appId: "1:880634786318:web:86c605758e8ef18b82825f",
  measurementId: "G-2HEJ3MLQZQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Chemin de base dynamique (GitHub Pages / racine) — même logique que Maison Sylla
export const BASE = window.location.hostname.includes("github.io")
  ? "/" + window.location.pathname.split("/")[1] + "/"
  : "/";
