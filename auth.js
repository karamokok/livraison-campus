function inscrire() {
  const nom = document.getElementById("nom").value;
  const password = document.getElementById("password").value;

  if (!nom || !password) {
    alert("Remplis tous les champs");
    return;
  }

  auth.createUserWithEmailAndPassword(nom + "@campus.com", password)
    .then(() => {
      alert("Compte créé !");
      window.location.href = "index.html";
    })
    .catch(error => alert(error.message));
}

function connecter() {
  const nom = document.getElementById("nom").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(nom + "@campus.com", password)
    .then(() => window.location.href = "index.html")
    .catch(error => alert(error.message));
}

// Vérifier la session sur index.html
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("index.html")) {
    window.location.href = "login.html";
  }
});
