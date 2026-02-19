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
  if (!currentUser) {
    alert("❌ Tu dois être connecté pour commander");
    return;
  }

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

  // Désactiver le bouton
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

  db.collection("commands").add(commande)
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
      
      // Réactiver le bouton
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer ma commande';
      
      chargerMesCommandes();
    })
    .catch(error => {
      console.error("❌ Erreur:", error);
      
      // Réactiver le bouton
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer ma commande';
      
      alert("❌ Erreur: " + error.message);
    });
}

function chargerMesCommandes() {
  if (!currentUser) return;

  console.log("📦 Chargement des commandes pour:", currentUser.email);
  
  db.collection("commands")
    .where("clientId", "==", currentUser.uid)
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      console.log("📊 Commandes trouvées:", snapshot.size);
      
      const ul = document.getElementById("mesCommandes");
      if (!ul) return;
      
      ul.innerHTML = "";
      
      if (snapshot.empty) {
        ul.innerHTML = "<li style='text-align: center; color: #666; padding: 20px;'>📭 Aucune commande pour le moment</li>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        
        // Déterminer le statut et son style
        let statusIcon = '⏳';
        let statusText = 'En attente';
        let statusColor = '#fff3cd';
        let statusTextColor = '#856404';
        
        if (data.status === 'acceptee') {
          statusIcon = '✅';
          statusText = 'Acceptée';
          statusColor = '#d4edda';
          statusTextColor = '#155724';
        } else if (data.status === 'livree') {
          statusIcon = '🎉';
          statusText = 'Livrée';
          statusColor = '#d1e7dd';
          statusTextColor = '#0f5132';
        }
        
        li.innerHTML = `
          <div style="display: flex; flex-direction: column; width: 100%; padding: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong style="font-size: 1.1rem;">🍔 ${data.repas}</strong>
              <span style="font-size: 0.8em; padding: 4px 10px; border-radius: 20px; background: ${statusColor}; color: ${statusTextColor}; font-weight: bold;">
                ${statusIcon} ${statusText}
              </span>
            </div>
            <div style="font-size: 0.9em; color: #444; margin-bottom: 5px;">
              📍 ${data.salle} (étage ${data.etage}) - ${data.filiere} ${data.niveau}
            </div>
            ${data.livreurPseudo ? `
              <div style="font-size: 0.85em; color: #28a745; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #ddd;">
                🛵 Livreur: ${data.livreurPseudo}
              </div>
            ` : `
              <div style="font-size: 0.85em; color: #666; margin-top: 5px; padding-top: 5px; border-top: 1px dashed #ddd;">
                ⏳ En attente d'un livreur...
              </div>
            `}
          </div>
        `;
        ul.appendChild(li);
      });
    }, error => {
      console.error("❌ Erreur chargement commandes:", error);
      
      const ul = document.getElementById("mesCommandes");
      if (ul) {
        ul.innerHTML = "<li style='text-align: center; color: red; padding: 20px;'>❌ Erreur de chargement</li>";
      }
    });
}