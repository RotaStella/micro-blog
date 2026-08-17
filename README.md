# Micro-Blog

Application web moderne et responsive de micro-blogging conçue dans le cadre d'un projet scolaire.

## Présentation

Micro-Blog permet aux utilisateurs de consulter, rechercher, filtrer et publier de courts articles en ligne. L'application intègre un système d'authentification simple basé sur `localStorage` et la persistance de données en fichier JSON.

## Note pédagogique sur la sécurité

> **Attention** : Ce projet utilise un stockage simple des mots de passe en texte clair dans un fichier JSON ainsi qu'une authentification gérée côté client via `localStorage`. Ce choix est fait dans un cadre strictement scolaire et pédagogique pour maintenir le code accessible aux débutants. Dans un environnement de production réel, il conviendrait de hacher les mots de passe avec `bcrypt` et d'utiliser un système de session sécurisé par `JWT` ou `express-session`.

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript Vanilla (Fetch API, LocalStorage)
- **Backend** : Node.js, Express.js
- **Stockage** : Fichiers JSON (`data/articles.json` et `data/users.json`)

## Installation

1. Ouvrir un terminal dans le dossier du projet.
2. Exécuter la commande suivante pour installer les dépendances :

```bash
npm install