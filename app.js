// Variable globale pour suivre l'utilisateur connecté
let currentUser = null;

// Afficher nom connecté
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    // On récupère le pseudo depuis Firestore
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        document.getElementById("bonjour").textContent = `👋 Salut, ${doc.data().pseudo || user.email.split('@')[0]} !`;
      } else {
        document.getElementById("bonjour").textContent = `👋 Salut, ${user.email.split('@')[0]} !`;
      }
    });
  }
});

// --- Gestion des livreurs ---
function seMettreDisponible() {
  if (!currentUser) return;

  let pseudo = document.getElementById("nomPersonne").value;
  if (!pseudo) {
    pseudo = currentUser.email.split('@')[0];
  }

  db.collection("personnes").add({
    userId: currentUser.uid,
    pseudo: pseudo,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("nomPersonne").value = '';
  });
}

// Liste des personnes en temps réel
db.collection("personnes").orderBy("timestamp", "desc").limit(10)
  .onSnapshot(snapshot => {
    const ul = document.getElementById("personnes");
    ul.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `<i class="fas fa-user-check"></i> <strong>${data.pseudo}</strong> est dehors <span style="margin-left: auto; font-size: 0.8em;">🛵</span>`;
      ul.appendChild(li);
    });
  });

// --- Gestion des commandes ---
function envoyerCommande() {
  if (!currentUser) return;
  const repas = document.getElementById("repas").value;
  if (!repas) return alert("Décris ta commande !");

  db.collection("commandes").add({
    clientId: currentUser.uid,
    clientPseudo: currentUser.email.split('@')[0],
    repas: repas,
    status: "en_attente",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    document.getElementById("repas").value = '';
  });
}

// Afficher commandes en temps réel
db.collection("commandes").where("status", "in", ["en_attente", "acceptee"]).orderBy("timestamp", "desc").limit(20)
  .onSnapshot(snapshot => {
    const ul = document.getElementById("commandes");
    ul.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      
      let statusIcon = data.status === 'en_attente' ? '⏳' : '✅';
      li.innerHTML = `<i class="fas fa-${data.status === 'en_attente' ? 'clock' : 'check-circle'}"></i> 
                      <strong>${data.clientPseudo}</strong> veut : ${data.repas} 
                      <span style="margin-left: auto; font-size: 0.9em;">${statusIcon}</span>`;
      
      // Bouton pour accepter la commande (si elle est en attente)
      if (data.status === 'en_attente' && currentUser) {
        const acceptBtn = document.createElement('button');
        acceptBtn.innerHTML = '<i class="fas fa-check"></i> Accepter';
        acceptBtn.style.marginLeft = '10px';
        acceptBtn.style.padding = '3px 8px';
        acceptBtn.style.fontSize = '0.8em';
        acceptBtn.style.background = '#28a745';
        acceptBtn.style.color = 'white';
        acceptBtn.style.border = 'none';
        acceptBtn.style.borderRadius = '5px';
        acceptBtn.style.cursor = 'pointer';
        acceptBtn.onclick = () => accepterCommande(doc.id, data);
        li.appendChild(acceptBtn);
      }
      
      ul.appendChild(li);
    });
  });

// Fonction pour accepter une commande
function accepterCommande(commandeId, commandeData) {
  if (!currentUser) return;
  
  if (confirm(`Tu veux livrer ${commandeData.repas} pour ${commandeData.clientPseudo} ?`)) {
    db.collection("commandes").doc(commandeId).update({
      livreurId: currentUser.uid,
      livreurPseudo: currentUser.email.split('@')[0],
      status: "acceptee"
    }).then(() => {
      alert("Commande acceptée ! Contacte le client pour les détails.");
    });
  }
}