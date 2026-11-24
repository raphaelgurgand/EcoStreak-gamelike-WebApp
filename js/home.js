// Page d'accueil : calculateur d'impact + menu adapté si l'utilisateur est connecté
const perDayInput = document.getElementById("per-day");
const perDayError = document.getElementById("per-day-error");
const impactResult = document.getElementById("impact-result");

function updateImpact() {
  const perDay = Number(perDayInput.value);
  if (!Number.isInteger(perDay) || perDay < 1 || perDay > 500) {
    perDayError.textContent = "Entrez un nombre entier entre 1 et 500.";
    perDayInput.setAttribute("aria-invalid", "true");
    impactResult.textContent = "";
    return;
  }
  perDayError.textContent = "";
  perDayInput.setAttribute("aria-invalid", "false");
  impactResult.textContent =
    "En un mois : " + perDay * 30 + " déchets ramassés. En un an : " + perDay * 365 + ".";
}

perDayInput.addEventListener("input", updateImpact);
document.getElementById("impact-form").addEventListener("submit", function (event) {
  event.preventDefault();
});
updateImpact();

if (getSession() !== null) {
  document.getElementById("nav-auth").innerHTML = '<a href="../dashboard.html">Mon tableau de bord</a>';
  document.getElementById("nav-cta").hidden = true;
}
