# Abricot - SaaS de gestion de projets collaboratifs

Abricot est une application SaaS de gestion de projets permettant aux utilisateurs de créer des projets, de gérer des tâches et de collaborer via des commentaires et des assignations.

Ce projet est réalisé dans le cadre de la formation **Développeur d'Application Full-Stack - OpenClassrooms**.

---

## Quick start
```bash
git clone https://github.com/roogido/oc-7-1-Abricot.git
cd oc-7-1-Abricot

cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev

cd ../frontend
npm install
npm run dev
```

---

## Fonctionnalités principales

- authentification utilisateur
- gestion des projets
- gestion des tâches
- commentaires sur les tâches
- gestion des rôles (`admin` / `contributeur`)
- vues liste et Kanban
- aide à la génération de tâches avec Mistral AI

---

## Prérequis

- Git
- Node.js 18+ (avec npm)
- deux terminaux pour lancer le backend et le frontend en parallèle

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/roogido/oc-7-1-Abricot.git
cd oc-7-1-Abricot
```

### 2. Installer et configurer le backend

```bash
cd backend
npm install
```

Créer le fichier `backend/.env` à partir de `backend/.env.example` avec le contenu suivant :

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
```

### 3. Initialiser la base de données

Depuis le dossier `backend` :

```bash
npx prisma generate
npx prisma db push
npm run seed
```

### 4. Installer et configurer le frontend

```bash
cd ../frontend
npm install
```

Créer le fichier `frontend/.env.local` à partir de `frontend/.env.local.example` :

```env
API_BASE_URL=http://localhost:8000
MISTRAL_API_KEY=la_cle_mistral_ai_ici
```

---

## Lancement de l'application

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

---

## Accès à l'application

- frontend : `http://localhost:3000`
- backend : `http://localhost:8000`
- Swagger : `http://localhost:8000/api-docs`

---

## Génération de tâches avec Mistral AI

Abricot intègre une fonctionnalité d'aide à la création de tâches depuis la page détail d'un projet.

### Rôle de la fonctionnalité

- proposer une première décomposition de tâches à partir du contexte projet et de la demande utilisateur
- fournir des suggestions prêtes à être relues avant création définitive

### Fonctionnement général

- l'utilisateur ouvre la génération IA depuis les actions du projet
- une demande est envoyée à une route API interne Next.js du frontend
- cette route transmet à Mistral le nom du projet, sa description et le besoin exprimé par l'utilisateur
- Mistral renvoie une liste structurée de tâches au format JSON
- la réponse est validée et nettoyée côté serveur avant d'être renvoyée à l'interface

### Configuration requise

- renseigner une clé personnelle et confidentielle dans `frontend/.env.local`
- utiliser la variable `MISTRAL_API_KEY`
- s'appuyer sur `frontend/.env.local.example` comme modèle
- sans cette clé, la génération automatique de tâches ne sera pas opérationnelle

### Confidentialité

- cette clé est strictement personnelle
- elle ne doit pas être partagée
- elle ne doit jamais être versionnée dans le dépôt

---

## Comptes de test

Après l'exécution de `npm run seed` dans le dossier `backend`, les comptes suivants sont disponibles :

- **Alice Martin** (`alice@example.com`) - propriétaire principale des projets (rôle `admin`)
- **Bob Dupont** (`bob@example.com`) - contributeur
- **Caroline Leroy** (`caroline@example.com`) - contributrice
- **David Moreau** (`david@example.com`) - contributeur
- **Emma Rousseau** (`emma@example.com`) - contributrice
- **François Dubois** (`francois@example.com`) - contributeur
- **Gabrielle Simon** (`gabrielle@example.com`) - contributrice
- **Henri Laurent** (`henri@example.com`) - contributeur
- **Isabelle Petit** (`isabelle@example.com`) - contributrice
- **Jacques Durand** (`jacques@example.com`) - contributeur

Mot de passe pour tous les utilisateurs :

```text
password123
```

---

## Architecture du projet

```text
Abricot
|-- backend                     -> API REST (Node.js, Express, Prisma, JWT)
`-- frontend                    -> Application web (Next.js + React)
    |-- .env.local.example      -> Exemple de variables d'environnement
    |-- public                  -> Ressources statiques
    `-- src
        |-- app                 -> Pages, layouts, routes API et navigation App Router
        |-- assets              -> Ressources front intégrées au code source
        |-- components          -> Composants UI et métier réutilisables
        |-- context             -> Contextes React partagés
        |-- hooks               -> Hooks personnalisés
        |-- lib                 -> Utilitaires techniques et helpers internes
        `-- services            -> Services d'accès aux API et logique cliente
```

---

## Stack technique

### Backend

- Node.js
- Express
- Prisma
- SQLite
- JWT Authentication
- swagger-jsdoc
- swagger-ui-express

### Frontend

- Next.js `16.1.6`
- React `19.2.3`
- React DOM `19.2.3`
- `lucide-react`

---

## Auteur

Salem Hadjali
