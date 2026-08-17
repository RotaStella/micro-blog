document.addEventListener("DOMContentLoaded", () => {
  const utilisateur = localStorage.getItem("userConnecte");
  if (utilisateur) {
    window.location.href = "index.html";
    return;
  }

  const registerForm = document.getElementById("registerForm");
  registerForm.addEventListener("submit", inscrireUtilisateur);
});

async function inscrireUtilisateur(event) {
  event.preventDefault();

  const nom = document.getElementById("nom").value.trim();
  const email = document.getElementById("email").value.trim();
  const motDePasse = document.getElementById("motDePasse").value;
  const confirmMotDePasse = document.getElementById("confirmMotDePasse").value;

  if (!nom || !email || !motDePasse || !confirmMotDePasse) {
    afficherMessage("✕ Tous les champs sont obligatoires.", "error");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    afficherMessage("✕ Format d'email invalide.", "error");
    return;
  }

  if (motDePasse.length < 6) {
    afficherMessage("✕ Le mot de passe doit contenir au moins 6 caractères.", "error");
    return;
  }

  if (motDePasse !== confirmMotDePasse) {
    afficherMessage("✕ Les mots de passe ne correspondent pas.", "error");
    return;
  }

  try {
    const reponse = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nom, email, motDePasse })
    });

    const data = await reponse.json();

    if (!data.success) {
      afficherMessage("✕ " + data.message, "error");
      return;
    }

    afficherMessage("✓ Inscription réussie ! Redirection...", "success");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);

  } catch (erreur) {
    afficherMessage("✕ Impossible de joindre le serveur.", "error");
  }
}

function afficherMessage(texte, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = texte;
  messageBox.className = `message-box ${type}`;
}