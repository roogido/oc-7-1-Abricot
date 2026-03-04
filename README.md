# Abricot – SaaS de gestion de projets collaboratifs

Abricot est une application SaaS de gestion de projets permettant aux utilisateurs de créer des projets, gérer des tâches et collaborer via commentaires et assignations.

Ce projet est réalisé dans le cadre de la formation **Développeur d’Application Full-Stack – OpenClassrooms**.

---

## Architecture du projet

```text
Abricot
│
├── backend     → API REST (Node.js, Express, Prisma, JWT)
└── frontend    → Application web (Next.js + React)
```

---

## Backend

API REST fournie par OpenClassrooms permettant :

- authentification JWT
- gestion des projets
- gestion des tâches
- gestion des rôles (admin / contributeur)
- commentaires sur les tâches

Documentation Swagger disponible sur :

```bash
http://localhost:8000/api-docs
```

## Configuration du backend (.env)

Créer un fichier .env dans le dossier backend :

```bash
backend/.env
```

Contenu :

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

Explication :

- DATABASE_URL : chemin vers la base SQLite utilisée par Prisma
- JWT_SECRET   : clé utilisée pour signer les tokens JWT d’authentification

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

## Installation

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

API disponible sur :
```bash
http://localhost:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Application disponible sur :
```bash
http://localhost:3000
```

---

## Comptes de test

Après le seeding de la base de données :

```text
email: alice@example.com
password: password123
```

---

## Technologies utilisées

Backend :

- Node.js
- Express
- Prisma
- SQLite
- JWT Authentication

Frontend :

- Next.js
- React

---

## Auteur

Salem Hadjali