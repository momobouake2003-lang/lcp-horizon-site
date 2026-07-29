// ============================================
// Panier — LCP Horizon International
// Stocké en localStorage (persiste entre les visites)
// ============================================

const CLE_PANIER = "lcpHorizonPanier";
const NUMERO_WHATSAPP = "2250576533996";

export function lirePanier() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PANIER)) || [];
  } catch {
    return [];
  }
}

function ecrirePanier(panier) {
  localStorage.setItem(CLE_PANIER, JSON.stringify(panier));
  document.dispatchEvent(new CustomEvent("panier:maj"));
}

export function ajouterAuPanier(produit, quantite) {
  const panier = lirePanier();
  const existant = panier.find(p => p.nom === produit.nom);
  if (existant) {
    existant.quantite += quantite;
  } else {
    panier.push({
      nom: produit.nom,
      prix: produit.prix,
      prixGros: produit.prixGros || produit.prix,
      qteGros: produit.qteGros || Infinity,
      image: produit.image,
      quantite: quantite
    });
  }
  ecrirePanier(panier);
}

export function modifierQuantite(nom, quantite) {
  let panier = lirePanier();
  if (quantite <= 0) {
    panier = panier.filter(p => p.nom !== nom);
  } else {
    const item = panier.find(p => p.nom === nom);
    if (item) item.quantite = quantite;
  }
  ecrirePanier(panier);
}

export function viderPanier() {
  ecrirePanier([]);
}

export function prixUnitaire(item) {
  return item.quantite >= item.qteGros ? item.prixGros : item.prix;
}

export function totalPanier() {
  return lirePanier().reduce((total, item) => total + prixUnitaire(item) * item.quantite, 0);
}

export function nombreArticles() {
  return lirePanier().reduce((n, item) => n + item.quantite, 0);
}

export function lienCommandeWhatsApp() {
  const panier = lirePanier();
  if (!panier.length) return `https://wa.me/${NUMERO_WHATSAPP}`;

  let message = "Bonjour, je souhaite commander :\n\n";
  panier.forEach(item => {
    const pu = prixUnitaire(item);
    const gros = item.quantite >= item.qteGros ? " (tarif de gros)" : "";
    message += `• ${item.nom} — ${item.quantite} x ${pu} FCFA${gros} = ${pu * item.quantite} FCFA\n`;
  });
  message += `\nTotal : ${totalPanier()} FCFA`;

  return `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
