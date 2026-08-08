import { db } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { EMAILJS_CONFIG } from "./emailjs-config.js";
import { showToast } from "./toast.js";

if (window.emailjs) {
  window.emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

// --- Anti-abus EmailJS (limite le quota gratuit de 200 e-mails/mois) ---
// Important : ceci reste une protection CÔTÉ NAVIGATEUR, donc contournable
// (navigation privée, autre appareil, appel direct à l'API EmailJS hors du
// site). La vraie protection est la restriction de domaine à configurer
// dans le tableau de bord EmailJS (Account > Security > Allowed origins).
// Ce garde-fou limite simplement les abus "faciles" depuis un même navigateur.
const CLE_RATE_LIMIT_EMAIL = "lcp-email-envois";
const LIMITE_EMAILS_PAR_HEURE = 3;
const FENETRE_RATE_LIMIT_MS = 60 * 60 * 1000;

function peutEnvoyerEmail() {
  let envois = [];
  try {
    envois = JSON.parse(localStorage.getItem(CLE_RATE_LIMIT_EMAIL)) || [];
  } catch {
    envois = [];
  }
  const maintenant = Date.now();
  envois = envois.filter(t => maintenant - t < FENETRE_RATE_LIMIT_MS);
  if (envois.length >= LIMITE_EMAILS_PAR_HEURE) {
    return false;
  }
  envois.push(maintenant);
  try {
    localStorage.setItem(CLE_RATE_LIMIT_EMAIL, JSON.stringify(envois));
  } catch {
    // localStorage indisponible (navigation privée stricte) : on laisse passer,
    // la réservation elle-même n'est jamais bloquée par ce garde-fou.
  }
  return true;
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

// --- Chargement + filtrage du catalogue de vols (collection "vols") ---
const volsListe = document.getElementById("vols-liste");
const rechercheInput = document.getElementById("vol-recherche");
const prixMinInput = document.getElementById("vol-prix-min");
const prixMaxInput = document.getElementById("vol-prix-max");
const triSelect = document.getElementById("vol-tri");

let tousLesVols = [];

// --- Skeleton loading ---
function afficherSkeleton() {
  volsListe.innerHTML = `
    <div class="vol-skeleton">
      <div class="vol-skeleton-line"></div>
      <div class="vol-skeleton-line short"></div>
    </div>
    <div class="vol-skeleton">
      <div class="vol-skeleton-line"></div>
      <div class="vol-skeleton-line short"></div>
    </div>
    <div class="vol-skeleton">
      <div class="vol-skeleton-line"></div>
      <div class="vol-skeleton-line short"></div>
    </div>
  `;
}

// --- État vide illustré ---
function afficherEtatVide() {
  volsListe.innerHTML = `
    <div class="vols-etat-vide">
      <div class="vols-etat-vide-icon">✈️</div>
      <h4>Aucun vol ne correspond à votre recherche</h4>
      <p>Essayez d'autres critères (ville, prix) ou faites une demande sur-mesure — nous trouverons la meilleure solution pour vous.</p>
      <button type="button" class="btn-primary" id="btn-etat-vide-demande" style="margin-top:8px;">Faire une demande sur-mesure</button>
    </div>
  `;
  const btn = document.getElementById("btn-etat-vide-demande");
  if (btn) {
    btn.addEventListener("click", () => {
      // Bascule vers le mode demande
      const btnDemande = document.querySelector('button[data-mode="demande"]');
      if (btnDemande) btnDemande.click();
    });
  }
}


function texteVol(v) {
  return `${v.villeDepart} → ${v.villeArrivee} — ${v.compagnie || ""} (${v.prix ? v.prix + " FCFA" : "prix sur demande"})`;
}

function selectionnerVol(id) {
  volSelect.value = id;
  document.querySelectorAll(".vol-card").forEach(c => {
    c.classList.toggle("selected", c.dataset.id === id);
  });
}

function rendreVolsFiltres() {
  const recherche = (rechercheInput.value || "").toLowerCase().trim();
  const prixMin = parseFloat(prixMinInput.value) || 0;
  const prixMax = parseFloat(prixMaxInput.value) || Infinity;
  const tri = triSelect.value;

  let liste = tousLesVols.filter(v => {
    const texte = `${v.villeDepart} ${v.villeArrivee} ${v.compagnie || ""}`.toLowerCase();
    const correspondRecherche = !recherche || texte.includes(recherche);
    const prix = v.prix ? Number(v.prix) : 0;
    const correspondPrix = (!v.prix) || (prix >= prixMin && prix <= prixMax);
    return correspondRecherche && correspondPrix;
  });

  if (tri === "prix-asc") liste.sort((a, b) => (Number(a.prix) || 0) - (Number(b.prix) || 0));
  if (tri === "prix-desc") liste.sort((a, b) => (Number(b.prix) || 0) - (Number(a.prix) || 0));

  if (!liste.length) {
    afficherEtatVide();
    return;
  }

  const selectionActuelle = volSelect.value;
  volsListe.innerHTML = liste.map(v => `
    <div class="vol-card${v.id === selectionActuelle ? ' selected' : ''}" data-id="${v.id}">
      <div>
        <div class="vol-route">${v.villeDepart} → ${v.villeArrivee}</div>
        <div class="vol-compagnie">${v.compagnie || "Compagnie non précisée"}</div>
      </div>
      <div class="vol-prix">${v.prix ? v.prix + " FCFA" : "Sur demande"}</div>
    </div>
  `).join("");

  volsListe.querySelectorAll(".vol-card").forEach(card => {
    card.addEventListener("click", () => selectionnerVol(card.dataset.id));
  });
}

[rechercheInput, prixMinInput, prixMaxInput].forEach(el =>
  el.addEventListener("input", rendreVolsFiltres)
);
triSelect.addEventListener("change", rendreVolsFiltres);

async function chargerVols() {
  afficherSkeleton();
  try {
    const snap = await getDocs(collection(db, "vols"));
    if (snap.empty) {
      volsListe.innerHTML = `<p class="vols-liste-vide">Aucun vol disponible pour le moment.</p>`;
      return;
    }
    tousLesVols = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Champ caché conservé pour la soumission du formulaire
    volSelect.innerHTML = tousLesVols
      .map(v => `<option value="${v.id}">${texteVol(v)}</option>`)
      .join("");

    rendreVolsFiltres();
  } catch (err) {
    console.error("Erreur chargement vols :", err);
    volsListe.innerHTML = `<p class="vols-liste-vide">Catalogue indisponible — réessayez plus tard.</p>`;
  }
}
chargerVols();

// Si on arrive depuis une carte destination (?destination=Dakar), on
// pré-remplit la recherche (pour filtrer visuellement la liste) et on
// présélectionne automatiquement le vol correspondant.
const destinationVoulue = new URLSearchParams(window.location.search).get("destination");
if (destinationVoulue) {
  rechercheInput.value = destinationVoulue;

  const essayerPreselection = () => {
    rendreVolsFiltres();
    const match = tousLesVols.find(v =>
      `${v.villeDepart} ${v.villeArrivee}`.toLowerCase().includes(destinationVoulue.toLowerCase())
    );
    if (match) {
      selectionnerVol(match.id);
      // Message clair pour confirmer visuellement le choix
      feedback.style.color = "var(--success)";
      feedback.textContent = `Vol vers ${destinationVoulue} présélectionné — vérifie les détails et complète le formulaire.`;
    }
  };
  setTimeout(essayerPreselection, 500);
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
    feedback.style.color = "var(--danger)";
    feedback.textContent = erreurs.join(" ");
    return;
  }

  feedback.style.color = "var(--text-light)";
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
      if (peutEnvoyerEmail()) {
        const trajet = data.mode === "direct"
          ? volSelect.options[volSelect.selectedIndex].textContent
          : `${data.depart || "?"} → ${data.arrivee || "?"}`;
        window.emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
          to_email: data.email,
          to_name: `${data.prenom} ${data.nom}`,
          trajet: trajet,
          date_aller: data.dateAller,
          passagers: data.passagers,
          mode: data.mode === "direct" ? "Réservation directe" : "Demande sur-mesure"
        }).catch(err => console.warn("E-mail non envoyé :", err));
      } else {
        console.warn("Limite d'envoi d'e-mails atteinte pour ce navigateur (anti-abus) — réservation tout de même enregistrée.");
      }
    }

    feedback.style.color = "var(--success)";
    feedback.textContent = "Votre demande a bien été envoyée. Nous vous contactons rapidement.";
    showToast("✅ Votre demande a été envoyée. Nous vous recontactons sous 24h.");
    form.reset();
  } catch (err) {
    console.error("Erreur envoi réservation :", err);
    feedback.style.color = "var(--danger)";
    feedback.textContent = "Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.";
    showToast("❌ Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.", { type: "error" });
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Envoyer ma réservation";
    }
  }
});
