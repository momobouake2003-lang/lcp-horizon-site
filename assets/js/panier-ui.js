import { lirePanier, modifierQuantite, totalPanier, nombreArticles, prixUnitaire, lienCommandeWhatsApp } from "./cart.js";

const toggle = document.getElementById("panier-toggle");
const overlay = document.getElementById("panier-overlay");
const drawer = document.getElementById("panier-drawer");
const closeBtn = document.getElementById("panier-close");
const itemsEl = document.getElementById("panier-items");
const totalEl = document.getElementById("panier-total");
const countEl = document.getElementById("panier-count");
const whatsappBtn = document.getElementById("panier-whatsapp");

function ouvrir() {
  drawer.classList.add("ouvert");
  overlay.classList.add("ouvert");
}
function fermer() {
  drawer.classList.remove("ouvert");
  overlay.classList.remove("ouvert");
}

toggle.addEventListener("click", ouvrir);
closeBtn.addEventListener("click", fermer);
overlay.addEventListener("click", fermer);

function rendre() {
  const panier = lirePanier();
  countEl.textContent = nombreArticles();
  totalEl.textContent = totalPanier().toLocaleString("fr-FR");
  whatsappBtn.href = lienCommandeWhatsApp();

  if (!panier.length) {
    itemsEl.innerHTML = `<p style="color:#888;padding:20px 0;">Ton panier est vide.</p>`;
    return;
  }

  itemsEl.innerHTML = panier.map(item => {
    const pu = prixUnitaire(item);
    const enGros = item.quantite >= item.qteGros;
    return `
      <div class="panier-item">
        <img src="${item.image.replace('../', '../')}" alt="${item.nom}">
        <div class="panier-item-info">
          <strong>${item.nom}</strong>
          <span style="font-size:0.78rem;color:${enGros ? '#3F5F44' : '#888'};">${pu} FCFA${enGros ? " (gros)" : ""}</span>
          <div class="panier-qte">
            <button class="q-moins" data-nom="${item.nom}">−</button>
            <span>${item.quantite}</span>
            <button class="q-plus" data-nom="${item.nom}">+</button>
            <button class="q-suppr" data-nom="${item.nom}" title="Retirer">🗑</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".q-moins").forEach(b => b.addEventListener("click", () => {
    const item = panier.find(p => p.nom === b.dataset.nom);
    modifierQuantite(b.dataset.nom, item.quantite - 1);
  }));
  itemsEl.querySelectorAll(".q-plus").forEach(b => b.addEventListener("click", () => {
    const item = panier.find(p => p.nom === b.dataset.nom);
    modifierQuantite(b.dataset.nom, item.quantite + 1);
  }));
  itemsEl.querySelectorAll(".q-suppr").forEach(b => b.addEventListener("click", () => {
    modifierQuantite(b.dataset.nom, 0);
  }));
}

document.addEventListener("panier:maj", rendre);
rendre();
