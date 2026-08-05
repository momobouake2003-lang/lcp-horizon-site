// ============================================
// Toasts — LCP Horizon International
// Notifications flottantes en haut à droite.
// Utilisation :
//   import { showToast } from "./toast.js";
//   showToast("Message ici");                     // succès (par défaut)
//   showToast("Une erreur est survenue", { type: "error" });
// ============================================

let container = null;

function obtenirContainer() {
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, { type = "success", duree = 6000 } = {}) {
  const cont = obtenirContainer();

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button type="button" class="toast-close" aria-label="Fermer la notification">✕</button>
  `;
  cont.appendChild(toast);

  // Forcer un reflow avant d'ajouter la classe "visible" pour déclencher la transition
  requestAnimationFrame(() => toast.classList.add("visible"));

  let timer = setTimeout(fermer, duree);

  function fermer() {
    clearTimeout(timer);
    toast.classList.remove("visible");
    toast.classList.add("leaving");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }

  toast.querySelector(".toast-close").addEventListener("click", fermer);
  toast.addEventListener("mouseenter", () => clearTimeout(timer));
  toast.addEventListener("mouseleave", () => { timer = setTimeout(fermer, 2500); });

  return fermer;
}
