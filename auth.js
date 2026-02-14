// --- Inscription ---
function inscrire() {
  const nom = document.getElementById("nom").value.trim();
  const password = document.getElementById("password").value;

  if (!nom || !password) {
    alert("Remplis tous les champs !");
    return;
  }

  if (password.length < 6) {
    alert("Le mot de passe doit contenir au moins 6 caractères !");
    return;
  }

  const email = `${nom}@campus.com`;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert(`Compte créé pour ${nom} !`);
      window.location.href = "index.html";
    })
    .catch(error => {
      if (error.code === "auth/email-already-in-use") {
        alert("Ce nom est déjà utilisé !");
      } else if (error.code === "auth/invalid-email") {
        alert("Nom invalide !");
      } else {
        alert(error.message);
      }
    });
}

// --- Connexion ---
function connecter() {
  const nom = document.getElementById("nom").value.trim();
  const password = document.getElementById("password").value;

  if (!nom || !password) {
    alert("Remplis tous les champs !");
    return;
  }

  const email = `${nom}@campus.com`;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => window.location.href = "index.html")
    .catch(error => {
      if (error.code === "auth/user-not-found") {
        alert("Ce compte n'existe pas !");
      } else if (error.code === "auth/wrong-password") {
        alert("Mot de passe incorrect !");
      } else {
        alert(error.message);
      }
    });
}

// --- Vérifier session sur index.html ---
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("index.html")) {
    window.location.href = "login.html";
  }
});
