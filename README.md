# 🕹️ Transcendence

Projet web complet combinant **jeu**, **backend temps réel** et **interface terminal stylisée**.

---

## ⚙️ Installation

<details>
<summary>Linux only</summary>

### 📋 1. Dépendances

Docker, Docker Compose, Node.js (npm), GNU Make

* Docker & Docker Compose : [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
* Node.js (npm) : [https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/)

```bash id="mk7v2a"
sudo apt-get update
sudo apt-get install -y make
```

---

### 🚀 2. Cloner le projet

```bash id="z4x1pc"
git clone git@github.com:BenjaminRap/Transcendence.git transcendence
```

---

### 📁 3. Accéder au dossier

```bash id="u8n3df"
cd transcendence
```

---

### ▶️ 4. Lancer l’installation

```bash id="y2k9ls"
make all
```

---

### 🌐 5. Accéder à l’application

Ouvrez votre navigateur et allez sur :
[https://localhost:8080](https://localhost:8080)

⚠️ Un avertissement de sécurité apparaîtra (certificat auto-signé).
Il suffit de cliquer sur **“Avancé”** puis **“Continuer vers localhost”** (ou équivalent selon le navigateur).

</details>

---

## 🚀 Présentation

**Transcendence** est une application web basée sur une architecture **frontend / backend séparée**, avec :

* 🔐 gestion HTTPS côté frontend (certificat auto-signé)
* 🔁 frontend servant de **reverse proxy**
* ⚡ backend gérant :

  * les **WebSockets**
  * la **base de données**
  * la logique applicative

L’interface adopte un **style terminal interactif**, où toutes les actions passent par des commandes.

---

## 🏗️ Architecture

### Frontend

* Sert de **reverse proxy**
* Gère le **HTTPS (certificat auto-signé)**
* Interface utilisateur (terminal + UI)

### Backend

* Gestion des utilisateurs
* Authentification via **JWT**
* Communication temps réel via **WebSockets**
* Gestion des parties et du jeu en ligne
* Base de données

---

## 🧑‍💻 Commandes principales

### 🔓 Sans connexion

* `register` → créer un compte
* `login` → se connecter
* `pong` → lancer le jeu

---

### 🔐 Après connexion

* `logout` → se déconnecter
* `profile` → voir son profil
* `profile <username>` → voir le profil d’un autre utilisateur
* `kill profile` → fermer la vue profil

---

## 👤 Gestion des utilisateurs

### Création de compte

Le mot de passe doit contenir :

* au moins **8 caractères**
* une **majuscule**
* une **minuscule**
* un **caractère spécial**

**Exemple :**

```
azER123!
```

---

### Profil utilisateur

Le profil permet de :

* ✏️ changer son nom
* 🔒 modifier son mot de passe
* 🖼️ changer son avatar
* ❌ supprimer son compte
* 📊 consulter ses dernières parties
* 👥 voir sa liste d’amis

---

### Fonctionnalités sociales

* ➕ ajouter un utilisateur en ami
* 👀 voir l’activité des amis **en temps réel**
* 🔄 synchronisation via WebSockets

---

## 🎮 Jeu : Pong

Accessible via la commande :

```
pong
```

---

### Modes de jeu

* 🧍 1v1 local
* 🤖 contre un bot (3 niveaux de difficulté)
* 🌐 multijoueur en ligne
* 🏆 tournois (local ou en ligne)

---

### Tournois

* Phase de **pool** pour atteindre une puissance de 2
* Puis **arbre éliminatoire**

---

### Multijoueur en ligne

* Les parties sont **hostées côté serveur**
* Synchronisation via WebSockets

---

## 🌍 Environnements / Thèmes

Le projet propose plusieurs styles visuels :

---

### 🖥️ Terminal

* Interface principale
* Effets visuels :

  * particules de texte qui tombent
  * événements dynamiques (buts, début de partie…)

---

### 🎾 Pong Classic

* Interface simple et lisible
* Style minimaliste

---

### 🌿 Nature (procédural)

* Terrain généré procéduralement
* Shaders :

  * herbe
  * feuilles d’arbres
* 🌱 **Instancing GPU massif** pour l’herbe

---

## ⚙️ Technologies utilisées

* Frontend : interface terminal + UI web
* Backend :

  * WebSockets
  * JWT
  * Base de données
* Graphismes :

  * **BabylonJS** (3D)
  * shaders custom
  * génération procédurale

---

## 💡 Points techniques intéressants

* Reverse proxy custom côté frontend
* Authentification sécurisée via JWT
* Temps réel avec WebSockets
* Interface terminal entièrement interactive
* Rendu 3D temps réel dans un projet web
* Génération procédurale (terrain, végétation)
* Optimisation GPU (instancing)

---

## ⚠️ Remarques

* HTTPS fonctionne via **certificat auto-signé**
* Certaines fonctionnalités externes (authentification 42) ne sont plus disponibles

---

## 📌 Conclusion

**Transcendence** est un projet complet combinant :

* développement web
* temps réel
* rendu 3D
* gameplay

avec une forte identité visuelle et technique autour du **terminal interactif**.

---
