document.addEventListener("DOMContentLoaded", () => {
  const utilisateur = localStorage.getItem("userConnecte");
  if (utilisateur) {
    window.location.href = "index.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("reason") === "unauthorized") {
    afficherMessage("ℹ️ Vous devez être connecté pour accéder au Micro-Blog.", "info");
  }

  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", connecterUtilisateur);
});

async function connecterUtilisateur(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const motDePasse = document.getElementById("motDePasse").value;

  if (!email || !motDePasse) {
    afficherMessage("✕ Veuillez remplir tous les champs.", "error");
    return;
  }

  try {
    const reponse = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, motDePasse })
    });

    const data = await reponse.json();

    if (!data.success) {
      afficherMessage("✕ " + data.message, "error");
      return;
    }

    localStorage.setItem("userConnecte", JSON.stringify(data.user));
    window.location.href = "index.html";
  } catch (erreur) {
    afficherMessage("✕ Impossible de se connecter au serveur.", "error");
  }
}

function afficherMessage(texte, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = texte;
  messageBox.className = `message-box ${type}`;
}