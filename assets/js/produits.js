import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { PRODUITS as PRODUITS_LOCAUX } from "./produits-data.js";
import { ajouterAuPanier } from "./cart.js";

const grid = document.getElementById("produits-grid");
const catToggle = document.getElementById("cat-toggle");
let catActive = "tous";
let produits = [];

function cheminImage(p) {
  if (p.image.startsWith("../") || p.image.startsWith("http")) return p.image;
  return "../" + p.image;
}

function rendreProduits() {
  const liste = catActive === "tous"
    ? produits
    : produits.filter(p => p.categorie === catActive);

  if (!liste.length) {
    grid.innerHTML = `<p style="grid-column:1/-1;color:#6b7a6d;">Aucun produit dans cette catégorie pour le moment.</p>`;
    return;
  }

  grid.innerHTML = liste.map((p, i) => `
    <article class="nature-card">
      <div class="nature-img" style="background:none;">
        <img src="${cheminImage(p)}" alt="${p.nom}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="nature-body">
        <span class="nature-cat">${p.categorie === "cosmetiques" ? "Cosmétiques & soins" : "Compléments & plantes"}</span>
        <h3>${p.nom}</h3>
        <div class="nature-price">${p.prix} FCFA <span style="font-weight:400;font-size:0.75rem;color:#6b7a6d;">l'unité</span></div>
        ${p.prixGros ? `<div style="font-size:0.76rem;color:#3F5F44;">${p.prixGros} FCFA dès ${p.qteGros} unités (gros)</div>` : ""}
        <div class="qte-row" style="display:flex;align-items:center;gap:10px;margin-top:12px;">
          <input type="number" min="1" value="1" class="qte-input" data-idx="${i}" style="width:56px;padding:8px;border:1px solid #d8d3c5;border-radius:4px;">
          <button class="btn-ajouter" data-idx="${i}" style="flex:1;background:#3F5F44;color:#fff;border:none;padding:9px 12px;border-radius:4px;font-size:0.82rem;cursor:pointer;">Ajouter au panier</button>
        </div>
        <a href="https://wa.me/2250576533996?text=${encodeURIComponent("Bonjour, je suis intéressé(e) par : " + p.nom)}" target="_blank" rel="noopener" class="nature-cta" style="margin-top:10px;">Commander directement sur WhatsApp</a>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".btn-ajouter").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = btn.dataset.idx;
      const input = grid.querySelector(`.qte-input[data-idx="${idx}"]`);
      const quantite = Math.max(1, parseInt(input.value) || 1);
      ajouterAuPanier(liste[idx], quantite);
      btn.textContent = "Ajouté ✓";
      setTimeout(() => btn.textContent = "Ajouter au panier", 1200);
    });
  });
}

async function chargerProduits() {
  try {
    const snap = await getDocs(collection(db, "produitsNaturels"));
    produits = snap.empty
      ? PRODUITS_LOCAUX
      : snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("Firestore indisponible, repli sur le catalogue local :", err);
    produits = PRODUITS_LOCAUX;
  }
  rendreProduits();
}
chargerProduits();

catToggle.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  catActive = btn.dataset.cat;
  catToggle.querySelectorAll("button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  rendreProduits();
});
