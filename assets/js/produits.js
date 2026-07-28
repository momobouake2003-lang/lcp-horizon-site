import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { PRODUITS as PRODUITS_LOCAUX } from "./produits-data.js";

const grid = document.getElementById("produits-grid");
const catToggle = document.getElementById("cat-toggle");
let catActive = "tous";
let produits = [];

function cheminImage(p) {
  // Firestore stocke un chemin relatif à la racine du site ("assets/images/...")
  // Le catalogue local stocke déjà un chemin relatif à cette page ("../assets/images/...")
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

  grid.innerHTML = liste.map(p => `
    <article class="nature-card">
      <div class="nature-img" style="background:none;">
        <img src="${cheminImage(p)}" alt="${p.nom}" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="nature-body">
        <span class="nature-cat">${p.categorie === "cosmetiques" ? "Cosmétiques & soins" : "Compléments & plantes"}</span>
        <h3>${p.nom}</h3>
        <div class="nature-price">${p.prix} FCFA</div>
        <a href="https://wa.me/2250576533996?text=${encodeURIComponent("Bonjour, je suis intéressé(e) par : " + p.nom)}" target="_blank" rel="noopener" class="nature-cta">Commander sur WhatsApp</a>
      </div>
    </article>
  `).join("");
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
