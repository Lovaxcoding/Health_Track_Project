# 📝 HealthTrack : Suivi de Santé Personnel

## 🌟 Présentation du Projet
**HealthTrack** est une application web légère conçue pour aider les utilisateurs à centraliser et à visualiser leurs indicateurs de santé quotidiens (poids, rythme cardiaque, sommeil, etc.). 

L'objectif de ce mini-projet est double :
1. **Utilité personnelle :** Offrir un journal de bord simple et intuitif pour suivre son évolution physique.
2. **Maîtrise technique :** Servir de bac à sable pour consolider les bases de **PrismaORM** et découvrir **Vue 3**, tout en préparant les mécanismes d'isolation de données propres au **multi-tenancy**.

---

## 🏗️ Architecture & Concepts

### 🧩 Le Backend (Le Cœur Logique)
Propulsé par **Node.js** et **PrismaORM**, le backend est conçu selon une structure rigoureuse pour garantir la sécurité des données sensibles :
* **Modélisation Relationnelle :** Gestion stricte des liens entre les utilisateurs et leurs mesures de santé.
* **Isolation des Données :** Chaque requête est filtrée pour s'assurer qu'un utilisateur n'accède qu'à ses propres constantes (principe fondamental du multi-tenancy).
* **API REST :** Un contrat de communication clair pour permettre au frontend de lire, créer et supprimer des enregistrements.

### 🎨 Le Frontend (L'Interface Utilisateur)
Développé avec **Vue 3** et la **Composition API**, l'interface mise sur la réactivité et la clarté :
* **Tableau de Bord :** Une vue d'ensemble des dernières mesures saisies.
* **Saisie Intuitive :** Un formulaire dynamique pour enregistrer différents types de données (poids en kg, tension en mmHg, etc.).
* **Réactivité Chirurgicale :** Utilisation des `refs` de Vue 3 pour mettre à jour l'affichage instantanément sans recharger la page.

---

## 📊 Modèle de Données (Concepts Clés)

L'application s'articule autour de trois piliers principaux dans la base de données :

1.  **L'Utilisateur (User) :** L'entité centrale qui possède ses données.
2.  **Le Profil (Profile) :** Les informations statiques (taille, date de naissance) pour personnaliser les calculs.
3.  **L'Enregistrement (HealthRecord) :** Une donnée temporelle composée d'un **Type**, d'une **Valeur** et d'une **Unité**.

---

## 🚀 Objectifs d'Apprentissage
* **Prisma :** Maîtriser les migrations, les relations et les écritures imbriquées.
* **Vue 3 :** Comprendre le cycle de vie des composants et la gestion d'état.
* **Sécurité :** Introduire les bases de l'isolation de données ("Data Siloing").

---

> *"Prendre soin de ses données comme on prend soin de sa santé."*