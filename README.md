# LCP Horizon International

Site web de l'agence de voyage LCP Horizon International : réservation de vols (catalogue + demandes sur-mesure) et boutique de produits naturels.

## Stack technique

| Couche         | Choix                                              |
|----------------|-----------------------------------------------------|
| Front-end      | HTML5, CSS3, JavaScript (Vanilla, ES Modules)       |
| Base de données| Firebase Firestore                                  |
| Authentification | Firebase Authentication (Email/Mot de passe)      |
| Hébergement    | GitHub Pages                                        |
| PWA            | Service Worker + Web App Manifest                   |
| Messagerie client | WhatsApp (lien direct `wa.me`)                   |

Aucun framework (pas de React/Next.js) — cohérent avec le même choix technique que Maison Sylla, plus simple à maintenir et à héberger gratuitement.

## Structure du projet

```
lcp-horizon-site/
├── index.html                  Page d'accueil (destinations, produits en aperçu)
├── reservation.html             Formulaire réservation directe / demande
├── manifest.json                 Manifeste PWA
├── sw.js                         Service worker (cache offline)
├── firebase.json                 Config Firebase CLI (règles Firestore)
├── firestore.rules               Règles de sécurité Firestore
├── firestore.indexes.json        Index Firestore
├── .firebaserc                   Référence au projet Firebase
├── admin/
│   └── index.html                Tableau de bord (vols + réservations)
├── produits-naturels/
│   └── index.html                Catalogue produits naturels
└── assets/
    ├── css/style.css             Feuille de style unique
    ├── js/
    │   ├── firebase-config.js    Clés Firebase (à compléter)
    │   ├── main.js                Interactions générales + service worker
    │   ├── booking.js             Logique du formulaire de réservation
    │   ├── produits.js            Affichage du catalogue produits naturels
    │   ├── produits-data.js       Catalogue produits (statique pour l'instant)
    │   └── admin.js               Auth + gestion vols/réservations
    └── images/
        ├── lcp-horizon-logo.svg
        └── produits/              Photos des produits naturels
```

## 1. Créer le projet Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com) → **Ajouter un projet**
2. Active **Firestore Database** (mode production) et **Authentication** → méthode **E-mail/Mot de passe**
3. Dans **Paramètres du projet → Général**, ajoute une application Web et copie la config
4. Colle cette config dans `assets/js/firebase-config.js` :

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

5. Crée un compte admin dans **Authentication → Users → Ajouter un utilisateur** (c'est ce compte qui se connecte sur `/admin`)

## 2. Déployer les règles de sécurité Firestore

Les règles (`firestore.rules`) protègent tes données : n'importe qui peut soumettre une réservation, mais seul un admin connecté peut consulter/modifier les réservations ou gérer les vols.

```bash
npm install -g firebase-tools
firebase login
# Remplace TON_PROJECT_ID dans .firebaserc par l'ID de ton projet Firebase
firebase deploy --only firestore:rules
```

## 3. Déployer le site sur GitHub Pages

```bash
git init
git add .
git commit -m "Site LCP Horizon International"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/NOM_DU_REPO.git
git push -u origin main
```

Puis dans **Settings → Pages** du dépôt GitHub : source = branche `main`, dossier `/ (root)`.

⚠️ Respecte les conventions déjà utilisées sur Maison Sylla : noms de fichiers en **minuscules**, incrémenter `CACHE_VERSION` dans `sw.js` à chaque changement de CSS/JS.

## 4. Ajouter des vols au catalogue

Connecte-toi sur `/admin/index.html` avec le compte admin créé à l'étape 1, puis utilise le formulaire **Catalogue de vols** pour ajouter chaque route (ville départ, ville arrivée, compagnie, prix). Ces vols apparaissent automatiquement dans le menu déroulant de `reservation.html`.

## 5. Modifier le catalogue de produits naturels

Pour l'instant le catalogue est **statique**, dans `assets/js/produits-data.js` — ajoute/modifie une entrée :

```js
{
  nom: "Nom du produit",
  categorie: "cosmetiques", // ou "complements"
  prix: 3000,
  image: "../assets/images/produits/nom-fichier.jpg"
}
```

Dépose la photo correspondante dans `assets/images/produits/` (nom de fichier en minuscules).

*(Migration possible vers Firestore plus tard si tu veux gérer les produits depuis l'admin, comme les vols — dis-le-moi quand tu es prêt.)*

## 6. Numéro WhatsApp

Le numéro utilisé pour les commandes produits et le contact (`2250576533996`) est déjà intégré dans `index.html`, `produits.js` et le footer — à changer partout si besoin.

## 7. E-mail de confirmation automatique (EmailJS)

Actuellement, une réservation s'enregistre dans Firestore mais aucun e-mail n'est envoyé au client. Pour l'activer (gratuit jusqu'à 200 e-mails/mois) :

1. Crée un compte sur [emailjs.com](https://www.emailjs.com)
2. **Email Services** → *Add new service* → connecte ta boîte Gmail/Outlook → note le **Service ID**
3. **Email Templates** → *Create new template* → rédige le mail avec ces variables :
   `{{to_name}}`, `{{to_email}}`, `{{trajet}}`, `{{date_aller}}`, `{{passagers}}`, `{{mode}}` → note le **Template ID**
4. **Account → General** → copie ta **Public Key**
5. Colle les 3 valeurs dans `assets/js/emailjs-config.js`
6. Redéploie (`git add . && git commit -m "EmailJS" && git push`)

Tant que ces valeurs restent à `TON_...`, le site fonctionne normalement mais n'envoie simplement pas d'e-mail (aucune erreur pour le client).

## 8. Nom de domaine personnalisé

1. Achète un domaine (ex. `lcphorizon.com`) chez un registrar (Namecheap, OVH, Google Domains…)
2. Chez ton registrar, crée ces enregistrements DNS pointant vers GitHub Pages :
   - 4 enregistrements `A` vers : `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Un enregistrement `CNAME` pour `www` pointant vers `momobouake2003-lang.github.io`
3. Sur GitHub → Settings → Pages → champ **Custom domain** → entre ton nom de domaine → Save
4. Attends la propagation DNS (jusqu'à 24h), puis coche **Enforce HTTPS**


- Envoi automatique d'e-mail de confirmation (EmailJS ou Firebase Cloud Functions)
- Migration du catalogue produits vers Firestore avec gestion depuis l'admin
- Filtres de recherche de vols (dates, prix) sur `reservation.html`
