// --- Déconnexion ---
function logout() {
  auth.signOut()
    .then(() => window.location.href = "login.html")
    .catch(err => alert("Erreur lors de la déconnexion : " + err.message));
}

// --- Afficher nom connecté ---
auth.onAuthStateChanged(user => {
  if (user) {
    const nomAffiche = user.email.split("@")[0];
    document.getElementById("bonjour").textContent = "Connecté : " + nomAffiche;
  }
});

// --- Ajouter une personne dehors (sans doublon) ---
function seMettreDisponible() {
  const user = auth.currentUser;
  if (!user) return alert("Tu dois être connecté !");

  let nom = document.getElementById("nomPersonne").value.trim();
  if (!nom) nom = user.email.split("@")[0];
  if (!nom) return alert("Nom invalide !");

  // Vérifier si la personne est déjà dans la collection
  db.collection("personnes")
    .where("nom", "==", nom)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        alert(`${nom} est déjà marqué comme dehors !`);
        return;
      }

      // Ajouter la personne si pas de doublon
      db.collection("personnes").add({
        nom: nom,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(() => {
        document.getElementById("nomPersonne").value = "";
      })
      .catch(err => alert("Erreur : " + err.message));
    });
}

// --- Liste des personnes en temps réel ---
const personnesUl = document.getElementById("personnes");
db.collection("personnes").orderBy("timestamp")
  .onSnapshot(snapshot => {
    personnesUl.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = `${doc.data().nom} est dehors et peut acheter à manger`;
      personnesUl.appendChild(li);
    });
  });

// --- Envoyer une commande ---
function envoyerCommande() {
  const user = auth.currentUser;
  const repas = document.getElementById("repas").value.trim();

  if (!user) return alert("Tu dois être connecté !");
  if (!repas) return alert("Remplis le repas !");

  db.collection("commandes").add({
    client: user.email.split("@")[0],
    repas: repas,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    document.getElementById("repas").value = "";
  })
  .catch(err => alert("Erreur : " + err.message));
}

// --- Afficher commandes en temps réel ---
const commandesUl = document.getElementById("commandes");
db.collection("commandes").orderBy("timestamp")
  .onSnapshot(snapshot => {
    commandesUl.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = `${doc.data().client} veut : ${doc.data().repas}`;
      commandesUl.appendChild(li);
    });
  });
