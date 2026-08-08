// ============================================
// Utilitaires partagés — LCP Horizon International
// ============================================

// Échappe les caractères HTML spéciaux avant insertion dans du innerHTML.
// À utiliser systématiquement pour toute donnée provenant de Firestore
// (ou de toute source externe/utilisateur) injectée dans un template HTML,
// afin d'empêcher l'exécution de scripts injectés (XSS stocké).
//
// Exemple à risque sans cette fonction :
//   `<td>${r.nom}</td>`  ← si r.nom = "<img src=x onerror=alert(1)>", le
//   script s'exécute dans le navigateur de l'admin qui consulte le dashboard.
//
// Exemple sûr :
//   `<td>${escapeHtml(r.nom)}</td>`
export function escapeHtml(valeur) {
  if (valeur === null || valeur === undefined) return "";
  return String(valeur)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
