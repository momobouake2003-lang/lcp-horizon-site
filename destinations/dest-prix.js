import { db } from "../assets/js/firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Le nom de la destination à chercher est défini dans chaque page via
// window.DESTINATION_NOM avant le chargement de ce script.
const nomDestination = window.DESTINATION_NOM || "";
const prixEl = document.getElementById("dest-prix");
const devisesEl = document.getElementById("dest-prix-devises");

async function obtenirConversion(prixFcfa) {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/XOF");
    const data = await res.json();
    if (data.result !== "success") return null;
    const taux = data.rates;
    return {
      eur: prixFcfa * taux.EUR,
      usd: prixFcfa * taux.USD,
      mad: prixFcfa * taux.MAD
    };
  } catch (err) {
    console.warn("Conversion devises indisponible :", err);
    return null;
  }
}

async function chargerPrix() {
  if (!prixEl) return;
  try {
    const snap = await getDocs(collection(db, "vols"));
    const correspondants = snap.docs
      .map(d => d.data())
      .filter(v => (v.villeArrivee || "").toLowerCase().includes(nomDestination.toLowerCase()))
      .filter(v => v.prix);

    if (!correspondants.length) {
      prixEl.textContent = "Prix sur demande";
      return;
    }

    const prixMin = Math.min(...correspondants.map(v => Number(v.prix)));
    prixEl.innerHTML = `${prixMin.toLocaleString("fr-FR")} FCFA <small>à partir de, par personne</small>`;

    if (devisesEl) {
      const conv = await obtenirConversion(prixMin);
      if (conv) {
        devisesEl.textContent =
          `≈ ${conv.eur.toLocaleString("fr-FR", {maximumFractionDigits:0})} € · ` +
          `${conv.usd.toLocaleString("fr-FR", {maximumFractionDigits:0})} $ · ` +
          `${conv.mad.toLocaleString("fr-FR", {maximumFractionDigits:0})} MAD ` +
          `(taux indicatif du jour)`;
      }
    }
  } catch (err) {
    console.warn("Prix indisponible :", err);
    prixEl.textContent = "Prix sur demande";
  }
}

chargerPrix();
