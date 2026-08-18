# Micro-Blog

Micro-Blog est une petite application web de micro-blogging où on peut publier et découvrir des courtes publications.

## Description

Le but du projet est simple : permettre à des utilisateurs inscrits de partager des publications (avec un titre, une catégorie, un contenu et une image si on veut) et de les consulter, rechercher ou filtrer facilement. C'est un projet réalisé pour s'entraîner au développement web avec un vrai serveur derrière.

## Fonctionnalités

* Inscription et connexion (avec vérification de l'email et du mot de passe)
* Déconnexion / changement de compte
* Création d'une publication (titre, catégorie, contenu)
* Ajout d'une image, soit depuis l'appareil, soit via une URL
* Création de nouvelles catégories
* Filtrage des publications par catégorie
* Recherche parmi les publications
* Suppression d'une publication
* Affichage du nombre de publications et de catégories

## Technologies utilisées

* HTML5, CSS3, JavaScript pour la partie front-end
* Node.js et Express.js pour le serveur
* Fichiers JSON pour stocker les utilisateurs, publications et catégories
* LocalStorage pour garder l'utilisateur connecté d'une page à l'autre
* Hébergé sur Render

## Structure du projet

```text
micro-blog/
├── server.js
├── package.json
├── data/
│   ├── users.json
│   ├── articles.json
│   └── categories.json
└── public/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── css/
    │   ├── style.css
    │   ├── login.css
    │   └── register.css
    └── js/
        ├── script.js
        ├── login.js
        └── register.js
```

## Installation

1. Cloner ou télécharger le projet
2. Ouvrir le dossier dans VS Code
3. Ouvrir un terminal et installer les dépendances :
```bash
   npm install
```
4. Démarrer le serveur :
```bash
   npm start
```
5. Ouvrir `http://localhost:3000` dans le navigateur

## Utilisation

1. Créer un compte ou se connecter
2. Consulter les publications sur la page d'accueil
3. Rechercher ou filtrer par catégorie
4. Créer une publication (avec ou sans image)
5. Supprimer une publication si besoin
6. Se déconnecter depuis le menu utilisateur

## Auteur

Auteur : Rota Victoire Stella RANDRIANATOANDRO

## Contexte

Projet réalisé dans un cadre scolaire pour pratiquer le développement web full-stack.