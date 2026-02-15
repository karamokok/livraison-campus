function inscrire() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("❌ Remplis tous les champs");
    return;
  }

  if (password.length < 6) {
    alert("❌ Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  console.log("📝 Tentative d'inscription avec:", email);
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ Inscription réussie!", userCredential.user.email);
      
      // Créer le profil utilisateur dans Firestore
      return db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        pseudo: email.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      console.log("✅ Profil créé dans Firestore");
      alert("✅ Compte créé avec succès !");
      window.location.href = "role-choice.html";
    })
    .catch(error => {
      console.error("❌ ERREUR COMPLÈTE:", error);
      
      let message = "❌ Erreur : ";
      switch(error.code) {
        case 'auth/email-already-in-use':
          message += "Cet email est déjà utilisé";
          break;
        case 'auth/invalid-email':
          message += "Email invalide";
          break;
        case 'auth/weak-password':
          message += "Mot de passe trop faible (minimum 6 caractères)";
          break;
        default:
          message += error.message;
      }
      alert(message);
    });
}

function connecter() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("❌ Remplis tous les champs");
    return;
  }

  console.log("🔑 Tentative de connexion avec:", email);
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ Connexion réussie!", userCredential.user.email);
      alert("✅ Connexion réussie !");
      window.location.href = "role-choice.html";
    })
    .catch(error => {
      console.error("❌ ERREUR:", error);
      
      let message = "❌ Erreur : ";
      switch(error.code) {
        case 'auth/user-not-found':
          message += "Utilisateur non trouvé";
          break;
        case 'auth/wrong-password':
          message += "Mot de passe incorrect";
          break;
        case 'auth/invalid-email':
          message += "Email invalide";
          break;
        default:
          message += error.message;
      }
      alert(message);
    });
}

function logout() {
  console.log("👋 Déconnexion...");
  auth.signOut()
    .then(() => {
      console.log("✅ Déconnecté");
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("❌ Erreur déconnexion:", error);
      alert("Erreur lors de la déconnexion");
    });
}

// Vérifier l'état de la connexion
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("👤 Utilisateur connecté:", user.email);
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!user && (currentPage === "dashboard-client.html" || currentPage === "dashboard-livreur.html" || currentPage === "role-choice.html")) {
      console.log("🔄 Redirection vers login.html");
      window.location.href = "login.html";
    }
  } else {
    console.log("👤 Aucun utilisateur connecté");
  }
});