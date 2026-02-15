let currentUser = null;
let filtreActuel = 'toutes';

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    const bonjourElement = document.getElementById("bonjour");
    if (bonjourElement) {
      bonjourElement.textContent = `👋 Salut, ${user.email.split('@')[0]} !`;
    }
    chargerCommandesDisponibles();
    chargerMesLivraisons();
  }
});

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

function changerStatut() {
  const statutCheckbox = document.getElementById("statutLivreur");
  const statutTexte = document.getElementById("statutTexte");
  
  if (!statutCheckbox || !statutTexte) return;
  
  const estDisponible = statutCheckbox.checked;
  
  if (estDisponible) {
    statutTexte.textContent = "✅ Tu es disponible ! Les commandes apparaîtront ci-dessous.";
    statutTexte.style.color = "#28a745";
  } else {
    statutTexte.textContent = "⏸️ Tu n'es pas disponible pour l'instant";
    statutTexte.style.color = "#666";
  }
}

function seMettreDisponible() {
  const statutCheckbox = document.getElementById("statutLivreur");
  if (statutCheckbox) {
    statutCheckbox.checked = true;
  }
  changerStatut();
  
  if (!currentUser) return;
  
  db.collection("personnes").add({
    userId: currentUser.uid,
    pseudo: currentUser.email.split('@')[0],
    disponible: true,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(error => {
    console.error("Erreur disponibilité:", error);
  });
}

function chargerCommandesDisponibles() {
  if (!currentUser) return;

  db.collection("commandes")
    .where("status", "==", "en_attente")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      const ul = document.getElementById("commandesDisponibles");
      if (!ul) return;
      
      ul.innerHTML = "";
      
      if (snapshot.empty) {
        ul.innerHTML = "<li style='text-align: center; color: #666;'>Aucune commande disponible</li>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        
        li.innerHTML = `
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${data.nom || data.clientPseudo || 'Client'}</strong>
              <span style="font-size: 0.8em; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 12px;">⏳ En attente</span>
            </div>
            <div style="font-size: 0.9em; margin: 5px 0;">
              🍔 ${data.repas}
            </div>
            <div style="font-size: 0.85em; color: #666;">
              📍 ${data.salle || '?'} (étage ${data.etage || '?'}) - ${data.filiere || '?'} ${data.niveau || '?'}
            </div>
            ${data.instructions && data.instructions !== 'Aucune' ? `<div style="font-size: 0.8em; color: #666; margin: 5px 0;">📝 ${data.instructions}</div>` : ''}
            <button onclick="accepterCommande('${doc.id}')" class="btn-primary" style="margin-top: 10px; padding: 8px;">
              <i class="fas fa-check"></i> Accepter la livraison
            </button>
          </div>
        `;
        ul.appendChild(li);
      });
    }, error => {
      console.error("Erreur chargement commandes:", error);
    });
}

function accepterCommande(commandeId) {
  if (!currentUser) return;
  
  if (confirm("Tu veux accepter cette livraison ?")) {
    db.collection("commandes").doc(commandeId).update({
      livreurId: currentUser.uid,
      livreurPseudo: currentUser.email.split('@')[0],
      status: "acceptee",
      accepteeLe: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      alert("✅ Commande acceptée ! Va chercher le repas.");
      chargerMesLivraisons();
    })
    .catch(error => {
      console.error("❌ Erreur:", error);
      alert("Erreur: " + error.message);
    });
  }
}

function chargerMesLivraisons() {
  if (!currentUser) return;

  db.collection("commandes")
    .where("livreurId", "==", currentUser.uid)
    .where("status", "==", "acceptee")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      const ul = document.getElementById("mesLivraisons");
      if (!ul) return;
      
      ul.innerHTML = "";
      
      if (snapshot.empty) {
        ul.innerHTML = "<li style='text-align: center; color: #666;'>Aucune livraison en cours</li>";
        return;
      }

      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        
        li.innerHTML = `
          <div style="display: flex; flex-direction: column; width: 100%;">
            <div style="display: flex; justify-content: space-between;">
              <strong>${data.nom || data.clientPseudo}</strong>
              <span style="font-size: 0.8em; background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 12px;">✅ En cours</span>
            </div>
            <div style="font-size: 0.9em; margin: 5px 0;">
              🍔 ${data.repas}
            </div>
            <div style="font-size: 0.85em; color: #666;">
              📍 ${data.salle} (étage ${data.etage})
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button onclick="marquerLivree('${doc.id}')" class="btn-secondary" style="flex: 1; padding: 8px;">
                <i class="fas fa-check-circle"></i> Livrée
              </button>
            </div>
          </div>
        `;
        ul.appendChild(li);
      });
    }, error => {
      console.error("Erreur chargement livraisons:", error);
    });
}

function marquerLivree(commandeId) {
  db.collection("commandes").doc(commandeId).update({
    status: "livree",
    livreeLe: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert("🎉 Livraison terminée !");
    chargerMesLivraisons();
    chargerCommandesDisponibles();
  })
  .catch(error => {
    console.error("❌ Erreur:", error);
    alert("Erreur: " + error.message);
  });
}

function filtrerCommandes(filtre, event) {
  filtreActuel = filtre;
  
  if (event && event.target) {
    document.querySelectorAll('.btn-filter').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.classList.add('active');
  }
  
  // Pour l'instant juste un filtre visuel, à améliorer plus tard
  chargerCommandesDisponibles();
}