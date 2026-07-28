import { db, auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { PRODUITS } from "./produits-data.js";

const loginBox = document.getElementById("login-box");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const resBody = document.getElementById("res-body");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("admin-email").value;
  const pass = document.getElementById("admin-pass").value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (err) {
    loginError.textContent = "Identifiants incorrects.";
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBox.style.display = "none";
    dashboard.style.display = "block";
    ecouterReservations();
    ecouterVols();
    ecouterProduits();
  } else {
    loginBox.style.display = "block";
    dashboard.style.display = "none";
  }
});

function ecouterReservations() {
  const q = query(collection(db, "reservations"), orderBy("creeLe", "desc"));
  onSnapshot(q, (snap) => {
    if (snap.empty) {
      resBody.innerHTML = `<tr><td colspan="6">Aucune réservation pour le moment.</td></tr>`;
      return;
    }
    resBody.innerHTML = snap.docs.map(d => {
      const r = d.data();
      const trajet = r.mode === "direct"
        ? (r.vol || "—")
        : `${r.depart || "?"} → ${r.arrivee || "?"}`;
      return `
        <tr>
          <td>${r.prenom || ""} ${r.nom || ""}<br><span style="color:#888;">${r.email || ""}</span></td>
          <td>${trajet}</td>
          <td>${r.dateAller || "—"}</td>
          <td>${r.passagers || 1}</td>
          <td>${r.mode === "direct" ? "Directe" : "Demande"}</td>
          <td>
            <select class="statut-select" data-id="${d.id}">
              <option value="en_attente" ${r.statut === "en_attente" ? "selected" : ""}>En attente</option>
              <option value="confirmee" ${r.statut === "confirmee" ? "selected" : ""}>Confirmée</option>
              <option value="annulee" ${r.statut === "annulee" ? "selected" : ""}>Annulée</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");

    resBody.querySelectorAll(".statut-select").forEach(sel => {
      sel.addEventListener("change", async (e) => {
        await updateDoc(doc(db, "reservations", e.target.dataset.id), {
          statut: e.target.value
        });
      });
    });
  });
}

// --- Gestion du catalogue de vols ---
const volsBody = document.getElementById("vols-body");
const addVolBtn = document.getElementById("add-vol-btn");
const volFeedback = document.getElementById("vol-feedback");

addVolBtn.addEventListener("click", async () => {
  const villeDepart = document.getElementById("v-depart").value.trim();
  const villeArrivee = document.getElementById("v-arrivee").value.trim();
  const compagnie = document.getElementById("v-compagnie").value.trim();
  const prix = document.getElementById("v-prix").value.trim();

  if (!villeDepart || !villeArrivee) {
    volFeedback.style.color = "#b33535";
    volFeedback.textContent = "Ville de départ et d'arrivée obligatoires.";
    return;
  }

  try {
    await addDoc(collection(db, "vols"), { villeDepart, villeArrivee, compagnie, prix });
    volFeedback.style.color = "#3F5F44";
    volFeedback.textContent = "Vol ajouté.";
    document.getElementById("v-depart").value = "";
    document.getElementById("v-arrivee").value = "";
    document.getElementById("v-compagnie").value = "";
    document.getElementById("v-prix").value = "";
  } catch (err) {
    volFeedback.style.color = "#b33535";
    volFeedback.textContent = "Erreur lors de l'ajout.";
    console.error(err);
  }
});

function ecouterVols() {
  onSnapshot(collection(db, "vols"), (snap) => {
    if (snap.empty) {
      volsBody.innerHTML = `<tr><td colspan="4">Aucun vol dans le catalogue.</td></tr>`;
      return;
    }
    volsBody.innerHTML = snap.docs.map(d => {
      const v = d.data();
      return `
        <tr>
          <td>${v.villeDepart} → ${v.villeArrivee}</td>
          <td>${v.compagnie || "—"}</td>
          <td>${v.prix ? v.prix + " FCFA" : "—"}</td>
          <td><button data-id="${d.id}" class="del-vol" style="color:#b33535;background:none;border:none;font-size:0.8rem;">Supprimer</button></td>
        </tr>
      `;
    }).join("");

    volsBody.querySelectorAll(".del-vol").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        await deleteDoc(doc(db, "vols", e.target.dataset.id));
      });
    });
  });
}

// --- Gestion du catalogue produits naturels ---
const produitsBody = document.getElementById("produits-body");
const addProduitBtn = document.getElementById("add-produit-btn");
const seedProduitsBtn = document.getElementById("seed-produits-btn");
const produitFeedback = document.getElementById("produit-feedback");

addProduitBtn.addEventListener("click", async () => {
  const nom = document.getElementById("p-nom").value.trim();
  const categorie = document.getElementById("p-categorie").value;
  const prix = document.getElementById("p-prix").value.trim();
  const image = document.getElementById("p-image").value.trim();

  if (!nom) {
    produitFeedback.style.color = "#b33535";
    produitFeedback.textContent = "Le nom du produit est obligatoire.";
    return;
  }

  try {
    await addDoc(collection(db, "produitsNaturels"), { nom, categorie, prix, image });
    produitFeedback.style.color = "#3F5F44";
    produitFeedback.textContent = "Produit ajouté.";
    document.getElementById("p-nom").value = "";
    document.getElementById("p-prix").value = "";
    document.getElementById("p-image").value = "";
  } catch (err) {
    produitFeedback.style.color = "#b33535";
    produitFeedback.textContent = "Erreur lors de l'ajout.";
    console.error(err);
  }
});

// Import en un clic du catalogue de départ (8 produits déjà connus)
seedProduitsBtn.addEventListener("click", async () => {
  seedProduitsBtn.disabled = true;
  produitFeedback.style.color = "#555";
  produitFeedback.textContent = "Import en cours…";
  try {
    for (const p of PRODUITS) {
      await addDoc(collection(db, "produitsNaturels"), {
        nom: p.nom,
        categorie: p.categorie,
        prix: p.prix,
        image: p.image.replace("../", "") // chemin relatif à la racine du site
      });
    }
    produitFeedback.style.color = "#3F5F44";
    produitFeedback.textContent = "Catalogue de départ importé.";
  } catch (err) {
    produitFeedback.style.color = "#b33535";
    produitFeedback.textContent = "Erreur pendant l'import.";
    console.error(err);
  }
  seedProduitsBtn.disabled = false;
});

function ecouterProduits() {
  onSnapshot(collection(db, "produitsNaturels"), (snap) => {
    if (snap.empty) {
      produitsBody.innerHTML = `<tr><td colspan="4">Aucun produit — utilise "Importer le catalogue de départ" ou ajoute-en un.</td></tr>`;
      return;
    }
    produitsBody.innerHTML = snap.docs.map(d => {
      const p = d.data();
      return `
        <tr>
          <td>${p.nom}</td>
          <td>${p.categorie === "cosmetiques" ? "Cosmétiques & soins" : "Compléments & plantes"}</td>
          <td>${p.prix ? p.prix + " FCFA" : "—"}</td>
          <td><button data-id="${d.id}" class="del-produit" style="color:#b33535;background:none;border:none;font-size:0.8rem;">Supprimer</button></td>
        </tr>
      `;
    }).join("");

    produitsBody.querySelectorAll(".del-produit").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        await deleteDoc(doc(db, "produitsNaturels", e.target.dataset.id));
      });
    });
  });
}
