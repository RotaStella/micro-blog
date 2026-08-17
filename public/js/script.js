const utilisateurStocke = localStorage.getItem("userConnecte");

if (!utilisateurStocke) {
  window.location.href = "login.html?reason=unauthorized";
}

let userConnecte = null;
try {
  userConnecte = JSON.parse(utilisateurStocke);
} catch (e) {
  localStorage.removeItem("userConnecte");
  window.location.href = "login.html";
}

let articlesGlobal = [];
let categoriesGlobal = [];
let categorieActive = "Toutes";
let imageBase64 = ""; // Stocke l'image convertie depuis l'appareil

document.addEventListener("DOMContentLoaded", () => {
  initialiserMenuUtilisateur();
  chargerCategories(); // Charger d'abord les catégories, puis les articles
  initialiserGestionImage();
  initialiserGestionCategorie();

  const articleForm = document.getElementById("articleForm");
  articleForm.addEventListener("submit", ajouterArticle);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filtrerEtAfficherArticles);
});

function initialiserMenuUtilisateur() {
  if (userConnecte && userConnecte.nom) {
    document.getElementById("welcomeUserName").textContent = `Bonjour ${userConnecte.nom}`;
    document.getElementById("userAccountLabel").textContent = `👤 ${userConnecte.nom}`;
  }

  const dropdownBtn = document.getElementById("userDropdownBtn");
  const dropdownMenu = document.getElementById("userDropdown");

  dropdownBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdownMenu.classList.remove("show");
  });

  document.getElementById("btnSwitchAccount").addEventListener("click", () => {
    changerDeCompte();
  });

  document.getElementById("btnLogout").addEventListener("click", () => {
    deconnexion();
  });
}

function deconnexion() {
  localStorage.removeItem("userConnecte");
  window.location.href = "login.html";
}

function changerDeCompte() {
  localStorage.removeItem("userConnecte");
  window.location.href = "login.html";
}

// ----------------------------------------------------
// GESTION DES CATÉGORIES DYNAMIQUES
// ----------------------------------------------------

async function chargerCategories() {
  try {
    const reponse = await fetch("/categories");
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }
    categoriesGlobal = await reponse.json();
    remplirSelectCategories();
    afficherBoutonsFiltres();
    await chargerArticles(); // Charger les articles une fois les filtres prêts
  } catch (erreur) {
    console.error("Erreur catégories :", erreur);
    await chargerArticles();
  }
}

function remplirSelectCategories(categorieASelectionner = "") {
  const select = document.getElementById("categorie");
  select.innerHTML = `<option value="">Sélectionnez une catégorie</option>`;

  categoriesGlobal.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    if (cat === categorieASelectionner) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function afficherBoutonsFiltres() {
  const filterBar = document.getElementById("filterBar");
  filterBar.innerHTML = "";

  // Bouton par défaut : Toutes
  const btnToutes = document.createElement("button");
  btnToutes.className = `filter-btn ${categorieActive === "Toutes" ? "active" : ""}`;
  btnToutes.setAttribute("data-categorie", "Toutes");
  btnToutes.textContent = "Toutes";
  btnToutes.addEventListener("click", changerFiltreCategorie);
  filterBar.appendChild(btnToutes);

  // Boutons pour chaque catégorie
  categoriesGlobal.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = `filter-btn ${categorieActive === cat ? "active" : ""}`;
    btn.setAttribute("data-categorie", cat);
    btn.textContent = cat;
    btn.addEventListener("click", changerFiltreCategorie);
    filterBar.appendChild(btn);
  });
}

function changerFiltreCategorie(e) {
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach(btn => btn.classList.remove("active"));

  e.target.classList.add("active");
  categorieActive = e.target.getAttribute("data-categorie");
  filtrerEtAfficherArticles();
}

function initialiserGestionCategorie() {
  const btnToggle = document.getElementById("btnToggleAddCategory");
  const container = document.getElementById("addCategoryContainer");
  const btnAdd = document.getElementById("btnAddCategory");
  const input = document.getElementById("newCategoryInput");

  btnToggle.addEventListener("click", () => {
    container.classList.toggle("hidden");
    if (!container.classList.contains("hidden")) {
      input.focus();
    }
  });

  btnAdd.addEventListener("click", () => {
    ajouterNouvelleCategorie();
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ajouterNouvelleCategorie();
    }
  });
}

async function ajouterNouvelleCategorie() {
  const input = document.getElementById("newCategoryInput");
  const msgBox = document.getElementById("categoryMsg");
  const nomCategorie = input.value.trim();

  msgBox.textContent = "";
  msgBox.className = "inline-msg";

  if (!nomCategorie) {
    msgBox.textContent = "✕ Le nom de la catégorie ne peut pas être vide.";
    msgBox.className = "inline-msg error";
    return;
  }

  try {
    const reponse = await fetch("/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: nomCategorie })
    });

    const data = await reponse.json();

    if (!reponse.ok) {
      msgBox.textContent = `✕ ${data.message || "Erreur lors de l'ajout."}`;
      msgBox.className = "inline-msg error";
      return;
    }

    // Mise à jour locale
    categoriesGlobal.push(data.categorie);
    remplirSelectCategories(data.categorie);
    afficherBoutonsFiltres();
    mettreAJourStatistiques();

    input.value = "";
    document.getElementById("addCategoryContainer").classList.add("hidden");

    msgBox.textContent = "✓ Catégorie ajoutée";
    msgBox.className = "inline-msg success";

    setTimeout(() => {
      msgBox.textContent = "";
    }, 3000);

  } catch (erreur) {
    msgBox.textContent = "✕ Une erreur est survenue.";
    msgBox.className = "inline-msg error";
  }
}

// ----------------------------------------------------
// GESTION DES IMAGES LOCALES (BASE64)
// ----------------------------------------------------

function initialiserGestionImage() {
  const fileInput = document.getElementById("fileInput");
  const btnRemove = document.getElementById("btnRemoveImage");

  fileInput.addEventListener("change", gererSelectionImage);
  btnRemove.addEventListener("click", supprimerImageSelectionnee);
}

function gererSelectionImage(event) {
  const fichier = event.target.files[0];

  if (!fichier) return;

  // 1. Vérifier que c'est une image
  if (!fichier.type.startsWith("image/")) {
    afficherMessage("✕ Veuillez sélectionner une image.", "error");
    document.getElementById("fileInput").value = "";
    return;
  }

  // 2. Vérifier la taille (max 5 Mo = 5 * 1024 * 1024 octets)
  const tailleMaxOctets = 5 * 1024 * 1024;
  if (fichier.size > tailleMaxOctets) {
    afficherMessage("✕ L'image est trop grande. Taille maximale : 5 Mo.", "error");
    document.getElementById("fileInput").value = "";
    return;
  }

  // 3. Lire et convertir en Base64 avec FileReader
  const reader = new FileReader();

  reader.onload = function(e) {
    imageBase64 = e.target.result;

    // Afficher la prévisualisation
    const previewImg = document.getElementById("imagePreview");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const fileNameSpan = document.getElementById("imageFileName");

    previewImg.src = imageBase64;
    fileNameSpan.textContent = `✓ ${fichier.name}`;
    previewContainer.classList.remove("hidden");
  };

  reader.readAsDataURL(fichier);
}

function supprimerImageSelectionnee() {
  imageBase64 = "";
  document.getElementById("fileInput").value = "";
  document.getElementById("imagePreview").src = "";
  document.getElementById("imagePreviewContainer").classList.add("hidden");
}

// ----------------------------------------------------
// GESTION DES ARTICLES
// ----------------------------------------------------

async function chargerArticles() {
  const container = document.getElementById("articlesContainer");
  container.innerHTML = `<div class="status-message">Chargement des articles...</div>`;

  try {
    const reponse = await fetch("/articles");
    if (!reponse.ok) {
      throw new Error("Erreur de chargement");
    }
    articlesGlobal = await reponse.json();
    filtrerEtAfficherArticles();
    mettreAJourStatistiques();
  } catch (erreur) {
    container.innerHTML = `<div class="status-message">Impossible de charger les articles.</div>`;
  }
}

function filtrerEtAfficherArticles() {
  const recherche = document.getElementById("searchInput").value.toLowerCase();

  const articlesFitres = articlesGlobal.filter(article => {
    const correspondCategorie = (categorieActive === "Toutes") || (article.categorie === categorieActive);
    const correspondRecherche = article.titre.toLowerCase().includes(recherche) ||
                                article.categorie.toLowerCase().includes(recherche) ||
                                article.contenu.toLowerCase().includes(recherche);

    return correspondCategorie && correspondRecherche;
  });

  afficherArticles(articlesFitres);
}

function afficherArticles(articles) {
  const container = document.getElementById("articlesContainer");
  container.innerHTML = "";

  if (articles.length === 0) {
    container.innerHTML = `<div class="status-message">Aucune publication pour le moment.</div>`;
    return;
  }

  articles.forEach(article => {
    const dateFormatted = new Date(article.date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const imageHTML = article.image
      ? `<img src="${article.image}" alt="${article.titre}" class="card-image">`
      : `<div class="placeholder-image">Micro-Blog</div>`;

    const card = document.createElement("article");
    card.className = "article-card";
    card.innerHTML = `
      <div class="card-image-wrapper">
        ${imageHTML}
      </div>
      <div class="card-body">
        <span class="card-category">${article.categorie}</span>
        <h3 class="card-title">${article.titre}</h3>
        <p class="card-text">${article.contenu}</p>
        <div class="card-footer">
          <span>${dateFormatted}</span>
          <button class="btn-delete" onclick="supprimerArticle(${article.id})">Supprimer</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function ajouterArticle(event) {
  event.preventDefault();

  const titre = document.getElementById("titre").value.trim();
  const categorie = document.getElementById("categorie").value;
  const imageURL = document.getElementById("image").value.trim();
  const contenu = document.getElementById("contenu").value.trim();

  if (!titre || !categorie || !contenu) {
    afficherMessage("Veuillez remplir tous les champs obligatoires (*).", "error");
    return;
  }

  // Priorité : Image locale en Base64 > URL d'image distante > chaîne vide
  const imageFinale = imageBase64 || imageURL || "";

  const nouvelArticle = {
    titre: titre,
    categorie: categorie,
    image: imageFinale,
    contenu: contenu
  };

  try {
    const reponse = await fetch("/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nouvelArticle)
    });

    if (!reponse.ok) {
      throw new Error("Erreur de publication");
    }

    afficherMessage("Article publié avec succès !", "success");
    reinitialiserFormulaire();
    await chargerArticles();
  } catch (erreur) {
    afficherMessage("Une erreur est survenue lors de la publication.", "error");
  }
}

function reinitialiserFormulaire() {
  document.getElementById("articleForm").reset();
  supprimerImageSelectionnee();
  document.getElementById("addCategoryContainer").classList.add("hidden");
}

async function supprimerArticle(id) {
  const confirmation = confirm("Voulez-vous vraiment supprimer cet article ?");
  if (!confirmation) {
    return;
  }

  try {
    const reponse = await fetch(`/articles/${id}`, {
      method: "DELETE"
    });

    if (!reponse.ok) {
      throw new Error("Erreur de suppression");
    }

    await chargerArticles();
  } catch (erreur) {
    alert("Impossible de supprimer l'article.");
  }
}

function afficherMessage(texte, type) {
  const messageBox = document.getElementById("messageBox");
  messageBox.textContent = texte;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    messageBox.className = "message-box";
    messageBox.textContent = "";
  }, 4000);
}

function mettreAJourStatistiques() {
  const totalPublications = document.getElementById("totalPublications");
  const totalCategories = document.getElementById("totalCategories");

  totalPublications.textContent = articlesGlobal.length;
  totalCategories.textContent = categoriesGlobal.length;
}