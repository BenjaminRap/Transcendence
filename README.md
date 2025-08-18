# Transcendence
42 project ft_transcendence

# 🗂️ Structure et Hiérarchie du Projet

Ce projet est organisé en **plusieurs conteneurs Docker** pour séparer le développement frontend, le backend, et le déploiement en production.

---

## ⚙️ Conteneurs Docker

Le projet utilise **3 conteneurs** principaux :

| Conteneur | Rôle | Mode | Adresse |
|-----------|------|------|---------|
| `fastify` | Serveur **backend** | Dev + Prod | `https://localhost:8080/api/` |
| `vite`    | Serveur **frontend** + reverse proxy | Dev uniquement | `https://localhost:8080/` |
| `nginx`   | Serveur **frontend** + reverse proxy | Prod uniquement | `https://localhost:8080/` |

> 🔁 Nginx/Vite redirige les requêtes `/api/` vers Fastify (reverse proxy).  
> 🛡️ Cela centralise la gestion du HTTPS et évite les erreurs CORS.

---

## 🔐 HTTPS & Certificats

- Le projet utilise un **certificat auto-signé** généré via :  
  ```bash
  make certificates
  ```
- Appelé automatiquement dans `make all`
- Les fichiers `.crt` et `.key` sont fournis aux conteneurs `vite` et `nginx` via des **Docker secrets**

---

## 🛠️ Makefile – Commandes Clés

| Commande | Description |
|----------|-------------|
| `make all` | Compile + build en **production** |
| `make all PROFILE=dev` | Compile + build en **développement** |
| `make clean` | Supprime conteneurs, images, volumes Docker... |
| `make fclean` | `clean` + suppression des fichiers temporaires (.crt, .key, .js…) |
| `make compile` | Compile TypeScript et TailwindCSS |
| `make compile-watch` | Idem mais avec watch automatique |
| `make install` | Installe les dépendances du projet |

---

## 🧪 Compilation TypeScript

Configuration **modulaire** :

- `tsconfig.json` à la racine = configuration de base
- `tsconfig.frontend.json` et `tsconfig.backend.json` = spécifiques

| Zone | Utilisation de `tsc` | Rôle |
|------|----------------------|------|
| Backend (`/src/backend`) | ✅ Génère les fichiers `.js` |
| Frontend (`/src/frontend/dev/`) | ✅ Vérifie les types, mais ne compile pas (`vite` s’en occupe) |

> ⚠️ Vite **ne vérifie pas les types** → `tsc` est nécessaire pour les erreurs de compilation.

---

## 🎨 TailwindCSS

- **Compilé manuellement** via CLI (`tailwindcss`), pas via Vite
- Sortie : `/src/frontend/dev/public/css/`
- Sources analysées : `.ts`, `.html` du backend + frontend
- Classes dynamiques : déclarées dans `safelist` du `tailwind.config.js`

> Cela permet d’utiliser Tailwind **dans le backend** aussi, en respectant certaines conditions.

---

## 🏗️ Structure des Dossiers

```
/
├── Makefile
├── tailwind.config.js
├── tsconfig.json
├── dockerFiles/
│   └── nginx/
│       └── website/         # Fichiers build pour Nginx
├── src/
│   ├── backend/             # Code backend (Fastify)
│   └── frontend/
│       └── dev/
│           ├── public/      # HTML, CSS, assets statiques
│           └── src/         # TypeScript du frontend
```

---

## 🔁 Différences Dev / Prod

| Mode | Serveur | Détail |
|------|---------|--------|
| Développement | `vite` | Serveur local avec hot reload |
| Production | `nginx` | Sert les fichiers buildés, fait office de proxy pour `/api/` |

- En dev, `vite` a un **volume monté** (bind mount)
- En prod, `vite build` → les fichiers sont **copiés** dans `nginx/website`

---

## ✅ Résumé

- 🧠 Architecture claire : 3 conteneurs pour 3 rôles
- 🔒 HTTPS géré uniquement par Nginx/Vite (via certificat auto-signé)
- 📦 Fastify exposé  par nginx/Vite en reverse proxy via la route `/api/`
- 🎨 Tailwind compilé manuellement pour inclure toutes les classes (même backend)
- 🧪 TypeScript géré différemment en dev/prod
- 🧰 Un Makefile centralise toutes les opérations
- 🔁 Vite en mode dev, Nginx en prod
