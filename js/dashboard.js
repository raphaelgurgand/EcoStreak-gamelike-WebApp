// Tableau de bord : missions (CRUD), photo, XP, série, filtre et classement.
// Les données de chaque utilisateur sont séparées : clé "ecostreak_data_" + courriel.

const email = getSession();
const account = getUsers().find(function (user) { return user.email === email; });
const dataKey = "ecostreak_data_" + email;
const typeNames = { megots: "Mégots", bouteilles: "Bouteilles", bouchons: "Bouchons", autre: "Autre" };
const friends = [{ name: "Léa", xp: 340 }, { name: "Marc", xp: 215 }, { name: "Sofia", xp: 120 }];

const missionList = document.getElementById("mission-list");
const emptyMsg = document.getElementById("empty-msg");
const filterSelect = document.getElementById("filter");
const statusBox = document.getElementById("status");
const addForm = document.getElementById("add-form");
const addError = document.getElementById("add-error");
let data = null;

if (account === undefined) {
  window.location.href = "login.html"; // page protégée : il faut être connecté
} else {
  data = loadData();
  checkStreak();
  document.getElementById("user-name").textContent = account.name;
  document.getElementById("logout-btn").addEventListener("click", logout);
  filterSelect.addEventListener("change", render);
  addForm.addEventListener("submit", addGoal);
  render();
}

function loadData() {
  const saved = readStorage(dataKey, null);
  if (saved !== null && Array.isArray(saved.missions)) {
    return saved;
  }
  return {
    xp: 0, streak: 0, lastDate: null, nextId: 4,
    missions: [
      { id: 1, text: "Ramasser 10 mégots", type: "megots", xp: 30, doneDate: null, custom: false },
      { id: 2, text: "Ramasser 5 bouteilles en plastique", type: "bouteilles", xp: 25, doneDate: null, custom: false },
      { id: 3, text: "Ramasser 15 bouchons", type: "bouchons", xp: 20, doneDate: null, custom: false }
    ]
  };
}

function save() {
  writeStorage(dataKey, data);
}

function showStatus(message, isError) {
  statusBox.textContent = message;
  statusBox.className = isError ? "status bad" : "status";
}

// Si l'utilisateur a manqué un jour, la série retombe à 0
function checkStreak() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (data.lastDate !== dateString(new Date()) && data.lastDate !== dateString(yesterday)) {
    data.streak = 0;
    save();
  }
}

function completeMission(mission) {
  const today = dateString(new Date());
  mission.doneDate = today;
  data.xp += mission.xp;
  if (data.lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (data.lastDate === dateString(yesterday)) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }
    data.lastDate = today;
  }
  save();
  render();
}

// Vérification de la photo (SIMULÉE). Plus tard : envoi au serveur, qui appellera l'API d'IA.
function handlePhoto(input, mission) {
  const file = input.files[0];
  if (!file) {
    return;
  }
  if (!file.type.startsWith("image/")) {
    showStatus("Le fichier choisi doit être une image.", true);
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showStatus("L'image est trop lourde (5 Mo maximum).", true);
    return;
  }
  showStatus("Analyse de la photo en cours…", false);
  setTimeout(function () {
    completeMission(mission);
    showStatus("Photo vérifiée ! +" + mission.xp + " XP", false);
  }, 1500);
}

function editMission(mission) {
  const answer = prompt("Nouvel intitulé de l'objectif :", mission.text);
  if (answer === null) {
    return; // l'utilisateur a annulé
  }
  const text = answer.trim();
  if (text.length < 3 || text.length > 60) {
    showStatus("L'intitulé doit contenir entre 3 et 60 caractères.", true);
    return;
  }
  mission.text = text;
  save();
  render();
  showStatus("Objectif modifié.", false);
}

function deleteMission(mission) {
  if (!confirm("Supprimer cet objectif ?")) {
    return;
  }
  data.missions = data.missions.filter(function (m) { return m.id !== mission.id; });
  save();
  render();
  showStatus("Objectif supprimé.", false);
}

function addGoal(event) {
  event.preventDefault();
  const text = document.getElementById("goal-text").value.trim();
  const type = document.getElementById("goal-type").value;
  const quantity = Number(document.getElementById("goal-qty").value);

  if (text.length < 3 || text.length > 60) {
    addError.textContent = "L'objectif doit contenir entre 3 et 60 caractères.";
    return;
  }
  if (!typeNames[type]) {
    addError.textContent = "Type de déchet invalide.";
    return;
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
    addError.textContent = "La quantité doit être un entier entre 1 et 50.";
    return;
  }
  addError.textContent = "";
  data.missions.push({ id: data.nextId, text: text, type: type, xp: quantity * 2, doneDate: null, custom: true });
  data.nextId += 1;
  save();
  addForm.reset();
  render();
  showStatus("Objectif ajouté.", false);
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function buildMission(mission, today) {
  const done = mission.doneDate === today;
  const item = document.createElement("li");
  item.className = done ? "card mission done" : "card mission";

  const info = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = mission.text; // textContent : le texte de l'utilisateur n'est jamais interprété comme du HTML
  const meta = document.createElement("div");
  meta.className = "muted";
  meta.textContent = typeNames[mission.type] + " · " + mission.xp + " XP";
  info.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "actions";
  if (done) {
    const badge = document.createElement("strong");
    badge.textContent = "✔ Validée aujourd'hui";
    actions.appendChild(badge);
  } else {
    const label = document.createElement("label");
    label.className = "btn small vest";
    label.append("Valider avec une photo");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment"); // ouvre la caméra sur téléphone
    input.className = "visually-hidden";
    input.addEventListener("change", function () { handlePhoto(input, mission); });
    label.appendChild(input);
    actions.appendChild(label);
  }
  if (mission.custom) {
    actions.appendChild(makeButton("Modifier", "btn small ghost", function () { editMission(mission); }));
    actions.appendChild(makeButton("Supprimer", "btn small danger", function () { deleteMission(mission); }));
  }
  item.append(info, actions);
  return item;
}

function renderBoard() {
  const rows = friends.concat([{ name: account.name + " (vous)", xp: data.xp }]);
  rows.sort(function (a, b) { return b.xp - a.xp; });
  const board = document.getElementById("board");
  board.innerHTML = ""; // on vide seulement la liste
  rows.forEach(function (row, index) {
    const li = document.createElement("li");
    const name = document.createElement("span");
    const points = document.createElement("strong");
    name.textContent = (index + 1) + ". " + row.name;
    points.textContent = row.xp + " XP";
    li.append(name, points);
    board.appendChild(li);
  });
}

function render() {
  const today = dateString(new Date());
  let doneToday = 0;
  data.missions.forEach(function (m) {
    if (m.doneDate === today) {
      doneToday += 1;
    }
  });

  document.getElementById("stat-streak").textContent = data.streak;
  document.getElementById("stat-xp").textContent = data.xp;
  document.getElementById("stat-done").textContent = doneToday;
  document.getElementById("stat-level").textContent = Math.floor(data.xp / 100) + 1;
  document.getElementById("xp-fill").style.width = (data.xp % 100) + "%";
  document.getElementById("xp-text").textContent = (data.xp % 100) + " / 100 XP vers le niveau suivant";

  missionList.innerHTML = "";
  let shown = 0;
  for (const mission of data.missions) {
    if (filterSelect.value === "all" || mission.type === filterSelect.value) {
      missionList.appendChild(buildMission(mission, today));
      shown += 1;
    }
  }
  emptyMsg.hidden = shown > 0;
  renderBoard();
}
