function inscrire() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("❌ ERREUR : Remplis tous les champs");
    return;
  }

  if (password.length < 6) {
    alert("❌ ERREUR : Le mot de passe doit contenir au moins 6 caractères");
    return;
  }

  // Désactiver le bouton pour éviter les doubles clics
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription en cours...';
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        pseudo: email.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("✅ SUCCÈS ! Votre compte a été créé. Redirection...");
      window.location.href = "role-choice.html";
    })
    .catch(error => {
      console.error("❌ ERREUR:", error);
      
      // Réactiver le bouton
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-user-plus"></i> S\'inscrire';
      
      let message = "❌ ERREUR : ";
      switch(error.code) {
        case 'auth/email-already-in-use':
          message += "Cet email est déjà utilisé par un autre compte";
          break;
        case 'auth/invalid-email':
          message += "Format d'email invalide (ex: nom@domaine.com)";
          break;
        case 'auth/weak-password':
          message += "Mot de passe trop faible. Utilise au moins 6 caractères";
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
    alert("❌ ERREUR : Remplis tous les champs");
    return;
  }

  // Désactiver le bouton
  const btn = event.target;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
  
  auth.signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      alert("✅ SUCCÈS ! Connexion réussie. Redirection...");
      window.location.href = "role-choice.html";
    })
    .catch(error => {
      console.error("❌ ERREUR:", error);
      
      // Réactiver le bouton
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
      
      let message = "❌ ERREUR : ";
      switch(error.code) {
        case 'auth/user-not-found':
          message += "Aucun compte trouvé avec cet email";
          break;
        case 'auth/wrong-password':
          message += "Mot de passe incorrect. Réessaie";
          break;
        case 'auth/invalid-email':
          message += "Format d'email invalide";
          break;
        default:
          message += error.message;
      }
      alert(message);
    });
}

function logout() {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(error => {
      console.error("❌ Erreur déconnexion:", error);
      alert("Erreur lors de la déconnexion");
    });
}