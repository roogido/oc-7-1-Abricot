# Abricot – SaaS de gestion de projets collaboratifs

Abricot est une application SaaS de gestion de projets permettant aux utilisateurs de créer des projets, gérer des tâches et collaborer via commentaires et assignations.

Ce projet est réalisé dans le cadre de la formation **Développeur d’Application Full-Stack – OpenClassrooms**.

---

## Prérequis

- Git
- Node.js et npm
- Deux terminaux pour lancer le backend et le frontend en parallèle

---

## Installation du projet

Le projet peut être installé directement à partir du dépôt public suivant :

- [https://github.com/roogido/oc-7-1-Abricot](https://github.com/roogido/oc-7-1-Abricot)

### 1. Cloner le dépôt

```bash
git clone https://github.com/roogido/oc-7-1-Abricot.git
cd oc-7-1-Abricot
```

### 2. Configurer le backend

Créer le fichier `backend/.env` avec les variables suivantes :

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

Explication :

- `DATABASE_URL` : chemin vers la base SQLite utilisée par Prisma
- `JWT_SECRET` : clé utilisée pour signer les tokens JWT d’authentification

### 3. Configurer le frontend

Créer le fichier `frontend/.env.local` à partir de `frontend/.env.local.example`, puis compléter les variables demandées.

Variables à renseigner :

```env
API_BASE_URL=http://localhost:8000
MISTRAL_API_KEY="votre-clé-confidentielle-mistral"
```

- `API_BASE_URL` : URL du backend utilisée par le frontend
- `MISTRAL_API_KEY` : clé personnelle et confidentielle nécessaire pour activer la génération automatique de tâches avec Mistral AI

### 4. Installer les dépendances du backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
```

### 5. Lancer le backend

```bash
npm run dev
```

### 6. Installer les dépendances du frontend

Dans un second terminal, depuis la racine du projet :

```bash
cd frontend
npm install
```

### 7. Lancer le frontend

Toujours dans le second terminal :

```bash
npm run dev
```

---

## URLs utiles

- Frontend : `http://localhost:3000`
- Backend : `http://localhost:8000`
- Swagger : `http://localhost:8000/api-docs`

---

## Fonctionnalité Mistral AI

Abricot intègre une fonctionnalité d’aide à la création de tâches depuis la page détail d’un projet.

Rôle de la fonctionnalité :

- proposer une première décomposition de tâches à partir du contexte projet et de la demande utilisateur
- fournir des suggestions prêtes à être relues par un humain avant création définitive

Principe général :

- l’utilisateur ouvre la génération IA depuis les actions du projet
- une demande est envoyée à une route API interne Next.js du frontend
- cette route transmet à Mistral le nom du projet, sa description et le besoin exprimé par l’utilisateur
- Mistral renvoie une liste structurée de tâches au format JSON
- la réponse est validée et nettoyée côté serveur avant d’être renvoyée à l’interface

Configuration requise :

- renseigner une clé personnelle et confidentielle dans `frontend/.env.local`
- utiliser la variable `MISTRAL_API_KEY`
- s’appuyer sur `frontend/.env.local.example` comme modèle si besoin
- sans cette clé, la génération automatique de tâches avec l’IA ne sera pas opérationnelle

Avertissement de confidentialité :

- cette clé est strictement personnelle
- elle ne doit pas être partagée
- elle ne doit jamais être versionnée dans le dépôt

---

## Comptes de test

Après le seeding de la base de données avec `npm run seed` :

### Utilisateurs (10)

- **Alice Martin** (`alice@example.com`) - Propriétaire principale des projets (administratrice)
- **Bob Dupont** (`bob@example.com`) - Contributeur
- **Caroline Leroy** (`caroline@example.com`) - Contributrice
- **David Moreau** (`david@example.com`) - Contributeur
- **Emma Rousseau** (`emma@example.com`) - Contributrice
- **François Dubois** (`francois@example.com`) - Contributeur
- **Gabrielle Simon** (`gabrielle@example.com`) - Contributrice
- **Henri Laurent** (`henri@example.com`) - Contributeur
- **Isabelle Petit** (`isabelle@example.com`) - Contributrice
- **Jacques Durand** (`jacques@example.com`) - Contributeur

Alice est la propriétaire principale des projets et dispose du rôle administrateur. Les autres utilisateurs sont contributeurs d’un projet.

**Mot de passe pour tous les utilisateurs :** `password123`

Pour un complément d’informations sur la partie backend, consulter aussi [backend/README.md](backend/README.md).

---

## Architecture du projet

```text
Abricot
│
├── backend                     → API REST (Node.js, Express, Prisma, JWT)
└── frontend                    → Application web (Next.js + React)
    │
    ├── .env.local.example      → Exemple de variables d'environnement à renseigner
    ├── public                  → Ressources statiques accessibles côté client
    ├── src
    │   ├── app                 → Pages, layouts, routes API et navigation App Router
    │   ├── assets              → Ressources front intégrées au code source
    │   ├── components          → Composants UI et composants métier réutilisables
    │   ├── context             → Contextes React partagés dans l'application
    │   ├── hooks               → Hooks personnalisés
    │   ├── lib                 → Utilitaires techniques et helpers internes
    │   └── services            → Services d'accès aux API et logique cliente associée
    ├── .env.local              → Variables d'environnement locales du frontend
    ├── .gitignore              → Fichiers ignorés par Git
    ├── eslint.config.mjs       → Configuration ESLint
    ├── jsconfig.json           → Alias et configuration JavaScript
    ├── next.config.mjs         → Configuration Next.js
    ├── package.json            → Dépendances et scripts npm
    └── README.md               → Documentation spécifique du frontend
```

---

## Backend

API REST fournie par OpenClassrooms permettant :

- authentification JWT
- gestion des projets
- gestion des tâches
- gestion des rôles (admin / contributeur)
- commentaires sur les tâches

La documentation de l’API est accessible via Swagger.

---

## Frontend

Interface utilisateur développée avec :

- Next.js (App Router)
- React
- appels API vers le backend Abricot

Fonctionnalités principales :

- authentification utilisateur
- tableau de bord personnel
- gestion des projets
- gestion des tâches
- vue Kanban et liste

---

## Technologies utilisées

Backend (fourni par OC) :

- Node.js
- Express
- Prisma
- SQLite
- JWT Authentication
- `@prisma/client`
- `bcryptjs`
- `cors`
- `dotenv`
- `helmet`
- `jsonwebtoken`
- `morgan`
- `swagger-jsdoc`
- `swagger-ui-express`

Frontend :

- Next.js `16.1.6`
- React `19.2.3`
- React DOM `19.2.3`
- `lucide-react` : bibliothèque d’icônes utilisée dans l’interface

---

## Auteur

Salem Hadjali
