import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { EMAILJS_CONFIG } from "./emailjs-config.js";

if (window.emailjs) {
  window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

const toggle = document.getElementById("mode-toggle");
const modeDirect = document.getElementById("mode-direct");
const modeDemande = document.getElementById("mode-demande");
const volSelect = document.getElementById("vol");
const form = document.getElementById("booking-form");
const feedback = document.getElementById("form-feedback");

let currentMode = "direct";

// --- Bascule réservation directe / demande sur-mesure ---
toggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-mode]");
  if (!btn) return;
  currentMode = btn.dataset.mode;

  toggle.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const isDirect = currentMode === "direct";
  modeDirect.style.display = isDirect ? "block" : "none";
  modeDemande.style.display = isDirect ? "none" : "block";
  volSelect.required = isDirect;
});

// --- Chargement du catalogue de vols (collection "vols") ---
async function chargerVols() {
  volSelect.innerHTML = "";
  try {
    const snap = await getDocs(collection(db, "vols"));
    if (snap.empty) {
      volSelect.innerHTML = `<option value="">Aucun vol disponible pour le moment</option>`;
      return;
    }
    snap.forEach(doc => {
      const v = doc.data();
      const opt = document.createElement("option");
      opt.value = doc.id;
      opt.textContent = `${v.villeDepart} → ${v.villeArrivee} — ${v.compagnie || ""} (${v.prix ? v.prix + " FCFA" : "prix sur demande"})`;
      volSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Erreur chargement vols :", err);
    volSelect.innerHTML = `<option value="">Catalogue indisponible — réessayez plus tard</option>`;
  }
}
chargerVols();

// Si on arrive depuis une carte destination (?destination=Dakar), on essaie
// de présélectionner le vol correspondant dans le menu déroulant.
const destinationVoulue = new URLSearchParams(window.location.search).get("destination");
if (destinationVoulue) {
  const essayerPreselection = () => {
    const options = [...volSelect.options];
    const match = options.find(o => o.textContent.includes(destinationVoulue));
    if (match) volSelect.value = match.value;
  };
  // On attend que chargerVols() ait rempli le select
  setTimeout(essayerPreselection, 400);
}

// (Aller-retour / masquage du champ date retour est géré dans reservation.html,
// qui gère aussi le "required" en plus de l'affichage)

// --- Validation simple ---
function validerFormulaire(data) {
  const erreurs = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) erreurs.push("Adresse e-mail invalide.");
  if (!data.dateAller || new Date(data.dateAller) < new Date().setHours(0,0,0,0)) {
    erreurs.push("La date de départ doit être aujourd'hui ou dans le futur.");
  }
  if (currentMode === "direct" && !data.vol) erreurs.push("Sélectionnez une destination.");
  if (currentMode === "demande" && (!data.depart || !data.arrivee)) {
    erreurs.push("Indiquez la ville de départ et d'arrivée pour votre demande.");
  }
  return erreurs;
}

// --- Soumission ---
const btnSubmit = document.getElementById("btn-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());
  data.mode = currentMode;

  const erreurs = validerFormulaire(data);
  if (erreurs.length) {
    feedback.style.color = "#b33535";
    feedback.textContent = erreurs.join(" ");
    return;
  }

  feedback.style.color = "#555";
  feedback.textContent = "Envoi en cours…";
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Envoi en cours…";
  }

  try {
    await addDoc(collection(db, "reservations"), {
      ...data,
      statut: "en_attente",
      creeLe: serverTimestamp()
    });

    // Envoi de l'e-mail de confirmation (silencieux en cas d'échec :
    // la réservation est déjà enregistrée, l'e-mail est un plus)
    if (window.emailjs && EMAILJS_CONFIG.SERVICE_ID !== "TON_SERVICE_ID") {
      const trajet = data.mode === "direct"
        ? "Vol sélectionné"
        : `${data.depart || "?"} → ${data.arrivee || "?"}`;
      window.emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        to_email: data.email,
        to_name: `${data.prenom} ${data.nom}`,
        trajet: trajet,
        date_aller: data.dateAller,
        passagers: data.passagers,
        mode: data.mode === "direct" ? "Réservation directe" : "Demande sur-mesure"
      }).catch(err => console.warn("E-mail non envoyé :", err));
    }

    feedback.style.color = "#3F5F44";
    feedback.textContent = "Votre demande a bien été envoyée. Nous vous contactons rapidement.";
    form.reset();
  } catch (err) {
    console.error("Erreur envoi réservation :", err);
    feedback.style.color = "#b33535";
    feedback.textContent = "Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.";
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Envoyer ma réservation";
    }
  }
});