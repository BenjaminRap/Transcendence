# 🤝 Friend API Documention

Cette API permet de gérer les relations d'amitié entre utilisateurs.

## 🔒 Authentication

Tous les endpoints nécessitent une authentification via **Bearer Token**.

| Header | Type | Value |
| :--- | :--- | :--- |
| `Authorization` | String | `Bearer <YOUR_JWT_TOKEN>` |
| `Content-Type` | String | `application/json` |

---

## 📡 Endpoints

### 1. Gestion des Demandes

#### 📨 Envoyer une demande d'ami
Envoie une invitation à un autre utilisateur.

- **URL** : `POST /friend/request/:id`
- **Params** : `id` (integer) - L'ID de l'utilisateur cible.

**Réponses :**

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **201** | ✅ Demande envoyée | `{ "success": true, "message": "Friend request successfully sent" }` |
| **400** | ⚠️ Erreur logique | `{ "success": false, "message": "Already friends / Request already sent" }` |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |

---

#### ✅ Accepter une demande
Accepte une demande d'ami reçue (statut `PENDING` -> `ACCEPTED`).

- **URL** : `PUT /friend/accept/:id`
- **Params** : `id` (integer) - L'ID de l'utilisateur qui a envoyé la demande.

**Réponses :**

| Code | Description | Body |
| :--- | :--- | :--- |
| **204** | ✅ Accepté | *(Aucun contenu)* |
| **400** | ⚠️ Erreur logique | `{ "success": false, "message": "No pending request / Already friends" }` |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |

---

#### 🗑️ Supprimer un ami / Annuler une demande
Supprime une relation d'amitié existante ou annule/refuse une demande en cours.

- **URL** : `DELETE /friend/delete/:id`
- **Params** : `id` (integer) - L'ID de l'ami ou de la demande à supprimer.

**Réponses :**

| Code | Description | Body |
| :--- | :--- | :--- |
| **204** | ✅ Supprimé | *(Aucun contenu)* |
| **400** | ⚠️ Erreur logique | `{ "success": false, "message": "Not friends / No request found" }` |
| **404** | ❌ User introuvable | `{ "success": false, "message": "User not found" }` |

---

### 2. Récupération des Listes

#### 👥 Ma liste d'amis
Récupère la liste de tous les amis confirmés (`ACCEPTED`).

- **URL** : `GET /friend/search/myfriends`

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Friends list successfully found",
  "friendList": [
    {
      "status": "ACCEPTED",
      "updatedAt": "2024-01-15T12:00:00.000Z",
      "user": {
        "id": 42,
        "username": "Alice",
        "avatar": "http://...",
        "isOnline": true,
        "requesterId": 42
      }
    },
    { ... },
  ]
}
```

---

#### ⏳ Demandes en attente
Récupère la liste de toutes les demandes d'amis en cours (`PENDING`), qu'elles aient été **envoyées** ou **reçues** par l'utilisateur courant.

- **URL** : `GET /friend/search/pendinglist`

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Pending list successfully found",
  "friendList": [
    {
      "status": "PENDING",
      "updatedAt": "2024-01-15T12:30:00.000Z",
      "user": {
        "id": 99,
        "username": "Bob",
        "avatar": "http://...",
        "isOnline": false,
        "requesterId": 99
      }
    }
  ]
}
```

> **Note :** Le champ `requesterId` permet de savoir qui a initié la demande.
> - Si `user.id === user.requesterId`, la demande vient de cet utilisateur (Reçue).
> - Si `user.id !== user.requesterId`, vous avez envoyé la demande (Envoyée).
