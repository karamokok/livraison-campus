// Déconnexion
function logout() {
  auth.signOut().then(() => window.location.href = "login.html");
}

// Afficher nom connecté
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("bonjour").textContent = "Connecté : " + user.email.split("@")[0];
  }
});

// Ajouter une personne dehors
function seMettreDisponible() {
  const user = auth.currentUser;
  if (!user) return;

  let nom = document.getElementById("nomPersonne").value;
  if (!nom) nom = user.email.split("@")[0];

  db.collection("personnes").add({
    nom: nom,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });
}

// Liste des personnes en temps réel
db.collection("personnes").orderBy("timestamp")
  .onSnapshot(snapshot => {
    const ul = document.getElementById("personnes");
    ul.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().nom + " est dehors et peut acheter à manger";
      ul.appendChild(li);
    });
  });

// Envoyer commande
function envoyerCommande() {
  const user = auth.currentUser;
  const repas = document.getElementById("repas").value;

  if (!user || !repas) return alert("Remplis le repas");

  db.collection("commandes").add({
    client: user.email.split("@")[0],
    repas: repas,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("repas").value = "";
}

// Afficher commandes en temps réel
db.collection("commandes").orderBy("timestamp")
  .onSnapshot(snapshot => {
    const ul = document.getElementById("commandes");
    ul.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.data().client + " veut : " + doc.data().repas;
      ul.appendChild(li);
    });
  });
