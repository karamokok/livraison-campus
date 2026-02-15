let currentUser = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    const bonjourElement = document.getElementById("bonjour");
    if (bonjourElement) {
      bonjourElement.textContent = `👋 Salut, ${user.email.split('@')[0]} !`;
    }
    chargerMesCommandes();
  }
});

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

function envoyerCommande() {
  if (!currentUser) return;

  // Récupérer toutes les infos
  const commande = {
    clientId: currentUser.uid,
    clientEmail: currentUser.email,
    nom: document.getElementById("nomClient").value,
    filiere: document.getElementById("filiere").value,
    niveau: document.getElementById("niveau").value,
    salle: document.getElementById("salle").value,
    etage: document.getElementById("etage").value,
    repas: document.getElementById("repas").value,
    heureSouhaitee: document.getElementById("heureLivraison").value || "Dès que possible",
    instructions: document.getElementById("instructions").value || "Aucune",
    status: "en_attente",
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  // Vérifier les champs obligatoires
  if (!commande.nom || !commande.filiere || !commande.niveau || !commande.salle || !commande.etage || !commande.repas) {
    alert("❌ Remplis tous les champs obligatoires !");
    return;
  }

  db.collection("commandes").add(commande)
    .then(() => {
      alert("✅ Commande envoyée ! Un livreur va l'accepter bientôt.");
      
      // Réinitialiser le formulaire
      document.getElementById("nomClient").value = "";
      document.getElementById("filiere").value = "";
      document.getElementById("niveau").value = "";
      document.getElementById("salle").value = "";
      document.getElementById("etage").value = "";
      document.getElementById("repas").value = "";
      document.getElementById("heureLivraison").value = "";
      document.getElementById("instructions").value = "";
      
      chargerMesCommandes();
    })
    .catch(error => {
      console.error("❌ Erreur:", error);
      alert("Erreur: " + error.message);
    });
}

function chargerMesCommandes() {
  if (!currentUser) return;

  db.collection("commandes")
    .where("clientId", "==", currentUser.uid)
    .orderBy("timestamp", "desc")
    .limit(10)
    .onSnapshot(snapshot => {
      const ul = document.getElementById("mesCommandes");
      if (!ul) return;
      
      ul.innerHTML = "";
      
      if (snapshot.empty) {
        ul.innerHTML = "<li style='text-align: center; color: #666;'>Aucune commande pour le moment</li>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        
        let statusIcon = {
          'en_attente': '⏳ En attente',
          'acceptee': '✅ Acceptée',
          'livree': '🎉 Livrée'
        }[data.status] || '⏳';
        
        let statusColor = {
          'en_attente': '#fff3cd',
          'acceptee': '#d4edda',
          'livree': '#d1e7dd'
        }[data.status] || '#fff3cd';
        
        let statusTextColor = {
          'en_attente': '#856404',
          'acceptee': '#155724',
          'livree': '#0f5132'
        }[data.status] || '#856404';
        
        li.innerHTML = `
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>${data.repas}</strong>
              <span style="font-size: 0.8em; padding: 2px 8px; border-radius: 12px; background: ${statusColor}; color: ${statusTextColor}">
                ${statusIcon}
              </span>
            </div>
            <div style="font-size: 0.85em; color: #666; margin-top: 5px;">
              📍 ${data.salle} (étage ${data.etage}) - ${data.filiere} ${data.niveau}
            </div>
            ${data.livreurPseudo ? `<div style="font-size: 0.8em; color: #28a745; margin-top: 5px;">🛵 Livré par: ${data.livreurPseudo}</div>` : ''}
          </div>
        `;
        ul.appendChild(li);
      });
    });
}