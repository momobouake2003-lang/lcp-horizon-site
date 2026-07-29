// ============================================
// Catalogue produits naturels — LCP Horizon
// Catalogue statique pour démarrer rapidement.
// (Passera sur Firestore, collection "produitsNaturels",
// dès que tu voudras gérer ça depuis l'admin.)
//
// prixGros / qteGros : prix unitaire réduit appliqué automatiquement
// dans le panier dès que la quantité atteint qteGros (commande en gros).
// ============================================

export const PRODUITS = [
  {
    nom: "Curcuma en poudre",
    categorie: "complements",
    prix: 2500,
    prixGros: 2000,
    qteGros: 5,
    image: "../assets/images/produits/curcuma-poudre.jpg"
  },
  {
    nom: "Graines de courge",
    categorie: "complements",
    prix: 3000,
    prixGros: 2500,
    qteGros: 5,
    image: "../assets/images/produits/graines-courge.jpg"
  },
  {
    nom: "Graines de chia",
    categorie: "complements",
    prix: 3500,
    prixGros: 3000,
    qteGros: 5,
    image: "../assets/images/produits/graines-chia.jpg"
  },
  {
    nom: "Amandes décortiquées",
    categorie: "complements",
    prix: 4000,
    prixGros: 3500,
    qteGros: 5,
    image: "../assets/images/produits/amandes-bol.jpg"
  },
  {
    nom: "Pâte de dattes naturelle",
    categorie: "complements",
    prix: 2000,
    prixGros: 1600,
    qteGros: 10,
    image: "../assets/images/produits/pate-dattes.jpg"
  },
  {
    nom: "Amandes nature",
    categorie: "complements",
    prix: 4000,
    prixGros: 3500,
    qteGros: 5,
    image: "../assets/images/produits/amandes-nature.jpg"
  },
  {
    nom: "Huile essentielle naturelle",
    categorie: "cosmetiques",
    prix: 5000,
    prixGros: 4500,
    qteGros: 5,
    image: "../assets/images/produits/huile-essentielle.jpg"
  },
  {
    nom: "Mélange de fruits secs",
    categorie: "complements",
    prix: 3500,
    prixGros: 3000,
    qteGros: 5,
    image: "../assets/images/produits/fruits-secs-melange.jpg"
  }
];
