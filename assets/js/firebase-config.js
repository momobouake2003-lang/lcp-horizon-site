// ============================================
// LCP Horizon International — Config Firebase
// Remplace les valeurs ci-dessous par celles de
// ton projet Firebase (Console > Paramètres du projet)
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "lcp-horizon.firebaseapp.com",
  projectId: "lcp-horizon",
  storageBucket: "lcp-horizon.appspot.com",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Chemin de base dynamique (GitHub Pages / racine) — même logique que Maison Sylla
export const BASE = window.location.hostname.includes("github.io")
  ? "/" + window.location.pathname.split("/")[1] + "/"
  : "/";
