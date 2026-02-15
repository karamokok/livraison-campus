function inscrire() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert("Remplis tous les champs");
    return;
  }

  console.log("Tentative d'inscription avec:", email);
  
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("Succès!", userCredential);
      return db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        pseudo: email.split('@')[0],
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(() => {
      alert("Compte créé !");
      window.location.href = "dashboard.html";
    })
    .catch(error => {
      console.error("ERREUR:", error);
      alert("Erreur: " + error.message);
    });
}

function connecter() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "dashboard.html")
    .catch(error => {
      console.error("ERREUR:", error);
      alert("Erreur: " + error.message);
    });
}

function logout() {
  auth.signOut().then(() => window.location.href = "index.html");
}

// Redirection si non connecté
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("dashboard.html")) {
    window.location.href = "login.html";
  }
});