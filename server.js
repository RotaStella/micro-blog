const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const ARTICLES_FILE = path.join(__dirname, 'data', 'articles.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const CATEGORIES_FILE = path.join(__dirname, 'data', 'categories.json');

// Augmentation de la limite pour supporter le transfert d'images en Base64
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function lireJSON(fichier) {
  try {
    const data = fs.readFileSync(fichier, 'utf8');
    return JSON.parse(data);
  } catch (erreur) {
    return [];
  }
}

function sauvegarderJSON(fichier, donnees) {
  fs.writeFileSync(fichier, JSON.stringify(donnees, null, 2), 'utf8');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ROUTE : Récupérer toutes les catégories
app.get('/categories', (req, res) => {
  try {
    const categories = lireJSON(CATEGORIES_FILE);
    res.json(categories);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la récupération des catégories." });
  }
});

// ROUTE : Ajouter une nouvelle catégorie
app.post('/categories', (req, res) => {
  try {
    const { nom } = req.body;

    if (!nom || nom.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Le nom de la catégorie ne peut pas être vide."
      });
    }

    const categoriePropre = nom.trim();
    const categories = lireJSON(CATEGORIES_FILE);

    // Vérification des doublons (insensible à la casse et aux espaces)
    const existeDeja = categories.some(
      cat => cat.toLowerCase() === categoriePropre.toLowerCase()
    );

    if (existeDeja) {
      return res.status(400).json({
        success: false,
        message: "Cette catégorie existe déjà."
      });
    }

    categories.push(categoriePropre);
    sauvegarderJSON(CATEGORIES_FILE, categories);

    res.status(201).json({
      success: true,
      message: "Catégorie ajoutée avec succès.",
      categorie: categoriePropre
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout de la catégorie."
    });
  }
});

app.post('/register', (req, res) => {
  try {
    const { nom, email, motDePasse } = req.body;

    if (!nom || !email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires"
      });
    }

    const users = lireJSON(USERS_FILE);

    const utilisateurExistant = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (utilisateurExistant) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé"
      });
    }

    const nouvelUtilisateur = {
      id: Date.now(),
      nom: nom,
      email: email,
      motDePasse: motDePasse
    };

    users.push(nouvelUtilisateur);
    sauvegarderJSON(USERS_FILE, users);

    res.status(201).json({
      success: true,
      message: "Inscription réussie"
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription"
    });
  }
});

app.post('/login', (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    if (!email || !motDePasse) {
      return res.status(400).json({
        success: false,
        message: "Veuillez remplir tous les champs"
      });
    }

    const users = lireJSON(USERS_FILE);

    const utilisateur = users.find(
      user => user.email.toLowerCase() === email.toLowerCase() && user.motDePasse === motDePasse
    );

    if (!utilisateur) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect"
      });
    }

    res.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email
      }
    });
  } catch (erreur) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion"
    });
  }
});

app.get('/articles', (req, res) => {
  try {
    const articles = lireJSON(ARTICLES_FILE);
    res.json(articles);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la récupération des articles." });
  }
});

app.post('/articles', (req, res) => {
  try {
    const { titre, categorie, contenu, image } = req.body;

    if (!titre || !categorie || !contenu) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    const articles = lireJSON(ARTICLES_FILE);

    const nouvelArticle = {
      id: Date.now(),
      titre: titre,
      categorie: categorie,
      contenu: contenu,
      image: image || "",
      date: new Date().toISOString()
    };

    articles.unshift(nouvelArticle);
    sauvegarderJSON(ARTICLES_FILE, articles);

    res.status(201).json(nouvelArticle);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la création de l'article." });
  }
});

app.delete('/articles/:id', (req, res) => {
  try {
    const idParam = Number(req.params.id);
    const articles = lireJSON(ARTICLES_FILE);
    const nouveauxArticles = articles.filter(article => article.id !== idParam);

    if (articles.length === nouveauxArticles.length) {
      return res.status(404).json({ message: "Article introuvable." });
    }

    sauvegarderJSON(ARTICLES_FILE, nouveauxArticles);
    res.json({ message: "Article supprimé avec succès." });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'article." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});