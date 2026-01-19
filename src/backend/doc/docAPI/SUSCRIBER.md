# 👤 Subscriber API Documention

Cette API permet de gérer le profil de l'utilisateur (récupération, mise à jour, suppression).

## 🔒 Authentication

Tous les endpoints nécessitent une authentification via **Bearer Token**.

| Header | Type | Value |
| :--- | :--- | :--- |
| `Authorization` | String | `Bearer <YOUR_JWT_TOKEN>` |
| `Content-Type` | String | `application/json` (sauf pour l'upload d'avatar) |

---

## 📡 Endpoints

### 1. Gestion du Profil

#### 👤 Récupérer son profil
Récupère les informations du profil de l'utilisateur connecté, incluant les statistiques et les amis.

- **URL** : `GET /suscriber/profile`

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Profile successfully retrieved",
  "user": {
    "id": 1,
    "username": "user1",
    "avatar": "http://...",
    "gameStats": {
      "gamesPlayed": 10,
      "gamesWon": 5,
      "winRate": 50
    },
    "lastMatchs": [
      {
        "opponent": { "id": 2, "username": "rival", "avatar": "...", "isFriend": false },
        "matchResult": { "matchId": 100, "scoreWinner": 5, "scoreLoser": 3, "winner": { "id": 1, "guestName": null }, "loser": { "id": 2, "guestName": null } }
      },
      { ... }
    ],
    "friends": [
      { "id": 3, "username": "friend1", "status": "ACCEPTED", "isOnline": true },
      { ... }
    ]
  }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **401** | ❌ Non autorisé | `{ "success": false, "message": "Invalid or missing token" }` |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |

---

#### ✏️ Modifier le nom d'utilisateur
Met à jour le nom d'utilisateur.

- **URL** : `PUT /suscriber/update/username`
- **Body** : `{ "username": "NewUsername" }`

**Réponses :**

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **200** | ✅ Mis à jour | `{ "success": true, "message": "Profile successfully updated", "redirectTo": "...", "user": { ... } }` |
| **400** | ⚠️ Erreur input | `{ "success": false, "message": "Invalid input", "redirectTo": "..." }` |
| **409** | ⚠️ Conflit | `{ "success": false, "message": "User with this username already exist", "redirectTo": "..." }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |

---

#### 🔑 Modifier le mot de passe
Met à jour le mot de passe de l'utilisateur.

- **URL** : `PUT /suscriber/update/password`
- **Body** : `{ "currentPassword": "...", "newPassword": "...", "confirmNewPassword": "..." }`

**Réponses :**

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **200** | ✅ Mis à jour | `{ "success": true }` |
| **400** | ⚠️ Erreur input | `{ "success": false, "message": "Invalid input" }` |
| **409** | ⚠️ Conflit | `{ "success": false, "message": "invalid_credential" }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |

---

### 2. Gestion de l'Avatar

#### 🖼️ Modifier l'avatar
Met à jour l'image de profil. Extrait le fichier du `multipart/form-data`.

- **URL** : `PUT /suscriber/update/avatar`
- **Header** : `Content-Type: multipart/form-data`
- **Body** : Form-data avec le champ `avatar`.

**Réponses :**

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **200** | ✅ Mis à jour | `{ "success": true, "message": "Avatar successfully updated", "user": { ... } }` |
| **400** | ⚠️ Erreur | `{ "success": false, "message": "Error during avatar normalization or upload" }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |

---

#### 🗑️ Supprimer l'avatar
Supprime l'avatar personnalisé et remet l'avatar par défaut.

- **URL** : `DELETE /suscriber/delete/avatar`

**Réponses :**

| Code | Description | Body |
| :--- | :--- | :--- |
| **204** | ✅ Supprimé | *(Aucun contenu)* |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |

---

### 3. Suppression du Compte

#### 💀 Supprimer le compte
Supprime définitivement le compte utilisateur.

- **URL** : `DELETE /suscriber/deleteaccount`

**Réponses :**

| Code | Description | Body |
| :--- | :--- | :--- |
| **204** | ✅ Supprimé | *(Aucun contenu)* |
| **401** | ❌ Non autorisé | `{ "success": false, "message": "Invalid or missing token" }` |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |
| **500** | ⚠️ Erreur serveur | `{ "success": false, "message": "Internal server error" }` |


