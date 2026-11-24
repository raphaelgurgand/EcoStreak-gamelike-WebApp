// Fonctions partagées par toutes les pages.
// Pour l'instant, les données sont gardées dans le navigateur (localStorage).
// Plus tard, ces fonctions seront remplacées par des appels au serveur.

function readStorage(key, defaultValue) {
  try {
    const text = localStorage.getItem(key);
    if (text === null) {
      return defaultValue;
    }
    return JSON.parse(text);
  } catch (error) {
    return defaultValue; // données absentes ou corrompues : on repart de zéro
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readStorage("ecostreak_users", []);
}

function getSession() {
  return readStorage("ecostreak_session", null); // courriel de l'utilisateur connecté
}

function logout() {
  localStorage.removeItem("ecostreak_session");
  window.location.href = "index.html";
}

// Date locale au format AAAA-MM-JJ (toISOString donnerait la date UTC, donc parfois demain)
function dateString(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}
