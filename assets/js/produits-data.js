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
    image: "../assets/images/produits/curcuma-poudre.jpg",
    width: 1080,
    height: 1080
  },
  {
    nom: "Graines de courge",
    categorie: "complements",
    prix: 3000,
    prixGros: 2500,
    qteGros: 5,
    image: "../assets/images/produits/graines-courge.jpg",
    width: 679,
    height: 452
  },
  {
    nom: "Graines de chia",
    categorie: "complements",
    prix: 3500,
    prixGros: 3000,
    qteGros: 5,
    image: "../assets/images/produits/graines-chia.jpg",
    width: 447,
    height: 447
  },
  {
    nom: "Amandes décortiquées",
    categorie: "complements",
    prix: 4000,
    prixGros: 3500,
    qteGros: 5,
    image: "../assets/images/produits/amandes-bol.jpg",
    width: 640,
    height: 426
  },
  {
    nom: "Pâte de dattes naturelle",
    categorie: "complements",
    prix: 2000,
    prixGros: 1600,
    qteGros: 10,
    image: "../assets/images/produits/pate-dattes.jpg",
    width: 550,
    height: 517
  },
  {
    nom: "Amandes nature",
    categorie: "complements",
    prix: 4000,
    prixGros: 3500,
    qteGros: 5,
    image: "../assets/images/produits/amandes-nature.jpg",
    width: 646,
    height: 475
  },
  {
    nom: "Huile essentielle naturelle",
    categorie: "cosmetiques",
    prix: 5000,
    prixGros: 4500,
    qteGros: 5,
    image: "../assets/images/produits/huile-essentielle.jpg",
    width: 447,
    height: 447
  },
  {
    nom: "Mélange de fruits secs",
    categorie: "complements",
    prix: 3500,
    prixGros: 3000,
    qteGros: 5,
    image: "../assets/images/produits/fruits-secs-melange.jpg",
    width: 740,
    height: 414
  }
];
