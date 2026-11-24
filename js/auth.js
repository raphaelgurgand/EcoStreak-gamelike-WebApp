// Connexion et inscription : validation en direct côté client.
// IMPORTANT : la vraie vérification (et le hachage du mot de passe) se fera côté serveur.
// Ici, le mot de passe est validé mais JAMAIS enregistré.

const registerForm = document.getElementById("register-form");
const loginForm = document.getElementById("login-form");

// Affiche (ou efface) un message d'erreur sous un champ. Retourne true si le champ est valide.
function setError(input, message) {
  document.getElementById(input.id + "-error").textContent = message;
  input.setAttribute("aria-invalid", message === "" ? "false" : "true");
  return message === "";
}

function checkName(input) {
  const value = input.value.trim();
  if (value.length < 2 || value.length > 40) {
    return setError(input, "Le nom doit contenir entre 2 et 40 caractères.");
  }
  return setError(input, "");
}

function checkEmail(input) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(input.value.trim())) {
    return setError(input, "Entrez une adresse courriel valide (ex. : nom@exemple.com).");
  }
  return setError(input, "");
}

function checkPassword(input) {
  const value = input.value;
  if (value.length < 8) {
    return setError(input, "Le mot de passe doit contenir au moins 8 caractères.");
  }
  if (!/\d/.test(value)) {
    return setError(input, "Le mot de passe doit contenir au moins un chiffre.");
  }
  return setError(input, "");
}

function checkConfirm(input, passwordInput) {
  if (input.value !== passwordInput.value || input.value === "") {
    return setError(input, "Les deux mots de passe doivent être identiques.");
  }
  return setError(input, "");
}

if (registerForm) {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirm");

  nameInput.addEventListener("input", function () { checkName(nameInput); });
  emailInput.addEventListener("input", function () { checkEmail(emailInput); });
  passwordInput.addEventListener("input", function () { checkPassword(passwordInput); });
  confirmInput.addEventListener("input", function () { checkConfirm(confirmInput, passwordInput); });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    // On vérifie tous les champs pour afficher toutes les erreurs d'un coup
    const results = [
      checkName(nameInput),
      checkEmail(emailInput),
      checkPassword(passwordInput),
      checkConfirm(confirmInput, passwordInput)
    ];
    if (results.includes(false)) {
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const users = getUsers();
    if (users.some(function (user) { return user.email === email; })) {
      setError(emailInput, "Un compte existe déjà avec ce courriel.");
      return;
    }

    users.push({ name: nameInput.value.trim(), email: email }); // pas de mot de passe ici
    writeStorage("ecostreak_users", users);
    writeStorage("ecostreak_session", email);
    window.location.href = "dashboard.html";
  });
}

if (loginForm) {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const formError = document.getElementById("form-error");

  emailInput.addEventListener("input", function () { checkEmail(emailInput); });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    formError.textContent = "";
    const okEmail = checkEmail(emailInput);
    const okPassword = passwordInput.value === ""
      ? setError(passwordInput, "Entrez votre mot de passe.")
      : setError(passwordInput, "");
    if (!okEmail || !okPassword) {
      return;
    }

    const email = emailInput.value.trim().toLowerCase();
    const found = getUsers().find(function (user) { return user.email === email; });
    if (!found) {
      formError.textContent = "Courriel ou mot de passe incorrect.";
      return;
    }
    writeStorage("ecostreak_session", email);
    window.location.href = "dashboard.html";
  });
}
