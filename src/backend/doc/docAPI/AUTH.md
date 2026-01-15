# 🔐 Auth API Documentation

Cette API gère l'enregistrement, l'authentification et la gestion des sessions utilisateurs (JWT).

## 🔒 Authentication

Certains endpoints nécessitent un **Bearer Token**, d'autres sont publics (Register/Login).

| Header | Type | Value |
| :--- | :--- | :--- |
| `Authorization` | String | `Bearer <YOUR_JWT_TOKEN>` |
| `Content-Type` | String | `application/json` |

---

## 📡 Endpoints

### 1. Inscription et Connexion

#### 📝 Inscription (Register)
Crée un nouveau compte utilisateur.

- **URL** : `POST /auth/register`
- **Auth** : Public

**Body :**
```json
{
  "username": "Zaphod",
  "email": "zaphod@galaxy.com",
  "password": "Password123!"
}
```

**Réponses :**

**201 Created**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 42,
    "username": "Zaphod",
    "avatar": "http://..."
  },
  "tokens": {
    "accessToken": "eyJhbGcV...",
    "refreshToken": "eyJhbGcV..."
  }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **400** | ⚠️ Données Invalides | `{ "success": false, "message": "Invalid email format" }` |
| **409** | ⛔ Conflit | `{ "success": false, "message": "Email already exists" }` |
| **500** | ❌ Erreur Serveur | `{ "success": false, "message": "Internal server error" }` |

---

#### 🔑 Connexion (Login)
Authentifie un utilisateur existant via Email ou Username.

- **URL** : `POST /auth/login`
- **Auth** : Public

**Body :**
```json
{
  "identifier": "zaphod@galaxy.com", 
  "password": "Password123!"
}
```
*(Le champ `identifier` accepte soit l'email, soit le username)*

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Connection successful",
  "user": {
    "id": 42,
    "username": "Zaphod",
    "avatar": "http://..."
  },
  "tokens": {
    "accessToken": "eyJhbGcV...",
    "refreshToken": "eyJhbGcV..."
  }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **400** | ⚠️ Champs Manquants | `{ "success": false, "message": "Invalid input" }` |
| **401** | ⛔ Identifiants Incorrects | `{ "success": false, "message": "Invalid password" }` |

---

#### 🚀 Connexion via 42 (OAuth)
Finalise l'authentification OAuth avec l'Intra 42.

- **URL** : `GET /auth/callback?code=...`
- **Auth** : Public

**Params :**
- `code` (string) : Le code d'autorisation renvoyé par 42.

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "User logged in with 42",
  "user": { "id": 42, "username": "zaphod", ... },
  "tokens": { ... }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **400** | ⚠️ Code Manquant | `{ "success": false, "message": "Authorization code missing" }` |
| **401** | ⛔ Échec OAuth | `{ "success": false, "message": "Failed to exchange code" }` |

---

### 2. Gestion de Session

#### 🔄 Rafraîchir le Token (Refresh)
Renouvelle les tokens d'accès expirés.

- **URL** : `GET /auth/refresh`
- **Auth** : Bearer Token (RefreshToken requis)

**Réponses :**

**200 OK**
```json
{
  "success": true,
  "message": "Authentication token renewal successful",
  "tokens": {
    "accessToken": "eyJhbGcV...",
    "refreshToken": "eyJhbGcV..."
  }
}
```

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **401** | ⛔ Token Invalide | `{ "success": false, "message": "Invalid token" }` |
| **404** | ❌ User Introuvable | `{ "success": false, "message": "User not found" }` |

---

#### 🚪 Déconnexion (Logout)
Déconnecte l'utilisateur (Note: Avec JWT stateless, cela se fait principalement côté client en supprimant le token).

- **URL** : `POST /auth/logout`
- **Auth** : Bearer Token

**Réponses :**

| Code | Description | Body Example |
| :--- | :--- | :--- |
| **200** | ✅ Déconnecté | `{ "success": true, "message": "Logout successful" }` |
