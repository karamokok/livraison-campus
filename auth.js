function inscrire() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Remplis tous les champs");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Créer un profil utilisateur dans Firestore
      return db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        pseudo: email.split('@')[0], // Pseudo par défaut
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Compte créé !");
      window.location.href = "dashboard.html"; // REDIRECTION VERS DASHBOARD
    })
    .catch(error => alert(error.message));
}

function connecter() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html") // REDIRECTION VERS DASHBOARD
    .catch(error => alert(error.message));
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html"); // RETOUR À L'ACCUEIL
}

// Redirection si non connecté
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "login.html";
  }
});