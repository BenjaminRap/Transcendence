# 🔍 Users API Documentation

Cette API permet de rechercher des utilisateurs et de récupérer leurs profils publics, incluant leurs statistiques de jeu et leur historique.

## 🔒 Authentication

Tous les endpoints nécessitent une authentification via **Bearer Token**.

| Header | Type | Value |
| :--- | :--- | :--- |
| `Authorization` | String | `Bearer <YOUR_JWT_TOKEN>` |
| `Content-Type` | String | `application/json` |

---

## 📡 Endpoints

### 1. Recherche et Profils

#### 🆔 Récupérer un profil par ID
Récupère les informations complètes d'un utilisateur spécifique via son ID.

- **URL** : `GET /users/search/id/:id`
- **Params** : `id` (integer) - L'ID de l'utilisateur recherché.

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "user": {
    "id": 42,
    "avatar": "http://localhost:8181/static/public/avatarDefault.webp",
    "username": "Zaphod",
    "stats": {
      "wins": 10,
      "losses": 5,
      "total": 15,
      "winRate": 66.67
    },
    "lastMatchs": [
      {
        "opponent": {
          "id": 21,
          "username": "Arthur",
          "avatar": "http://...",
          "isFriend": false
        },
        "matchResult": {
          "matchId": 101,
          "scoreWinner": 11,
          "scoreLoser": 5,
          "duration": 300,
          "winner": { "id": 42, "guestName": null },
          "loser": { "id": null, "guestName": "Guest_2337" }
         }
      }
    ],
    "isFriend": false
  }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **400** | ⚠️ ID Invalide | `{ "success": false, "message": "Invalid param" }` |
| **404** | ❌ Introuvable | `{ "success": false, "message": "User not found" }` |

---

#### 🔍 Rechercher par nom d'utilisateur
Recherche une liste d'utilisateurs dont le pseudo contient la chaîne fournie.

- **URL** : `GET /users/search/username/:username`
- **Params** : `username` (string) - Le terme de recherche.

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Profiles successfully retrieved",
  "user": [
    {
      "id": 42,
      "username": "Zaphod",
      "avatar": "http://...",
      "stats": { ... },
      "lastMatchs": [ ... ],
      "isFriend": true
    },
    ...
  ]
}
```ts
    },
    {
      "id": 84,
      "username": "Ford",
      ...
    }
  ]
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **400** | ⚠️ Format Invalide | `{ "success": false, "message": "Invalid input" }` |
| **404** | ❌ Aucun résultat | `{ "success": false, "message": "No one was found" }` |
