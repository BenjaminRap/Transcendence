
# 🔌 WebSocket Documentation

La communication en temps réel (WebSocket) est utilisée pour :
- Le Matchmaking et le jeu.
- Le suivi du statut en ligne des utilisateurs.
- Les mises à jour de profil en temps réel.
- Les notifications de demandes d'amis.

---

## 🚀 Connexion & Authentification

### 1. Connexion Initiale (Guest)
Le client se connecte toujours initialement.

```typescript
const socket = io("https://localhost:8080", {
    path: "/socket.io/",
    transports: ["websocket"],
    autoConnect: true,
});
```

### 2. Authentification
Pour s'identifier, le client doit émettre l'événement `authenticate` avec son token JWT. Le serveur renvoie un acquittement (ack) indiquant le succès ou l'échec.

```typescript
// Ex: Après login REST ou au chargement si un token existe
socket.emit("authenticate", { token: "votre_jwt_token" }, (result) => {
    if (result.success) {
        console.log("Connecté en tant qu'utilisateur !");
    } else {
        console.error("Échec auth:", result.error);
    }
});
```

---

## 📡 Événements Client (Emit)

Ces événements sont envoyés par le **Frontend** vers le **Backend**.

| Nom de l'événement | Données envoyées | Callback (Ack) | Description |
|-------------------|------------------|----------------|-------------|
| `authenticate` | `{ token: string }` | `(result: Result<null>) => void` | Authentifie la socket avec un JWT. |
| `join-matchmaking` | `void` | - | Demande à rejoindre la file d'attente pour un match. |
| `get-online-users` | `void` | `(ids: number[]) => void` | Demande la liste des IDs des utilisateurs connectés. |
| `watch-profile` | `profileIds: number[]` | - | S'abonne aux mises à jour (ex: status, avatar) d'une liste de profils spécifiques. |
| `unwatch-profile` | `profileIds: number[]` | - | Se désabonne des mises à jour de ces profils. |

---

## 📥 Événements Serveur (On)

Ces événements sont envoyés par le **Backend** vers le **Frontend**.

### Statut et Profil
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `user-status-change` | `{ userId: number, status: 'online' \| 'offline' }` | Notifie qu'un ami ou un profil surveillé vient de se connecter/déconnecter. |
| `profile-update` | `{ user: SanitizedUser }` | Notifie qu'un profil surveillé a été modifié. |
| `account-deleted` | `void` | Notifie que le compte courant a été supprimé. |

### Amis
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `friend-status-update` | `{ fromUserId: number, status: 'PENDING' \| 'ACCEPTED' }` | Notifie d'un changement d'état d'amitié (nouvelle demande ou acceptation). |

### Jeu (Stats)
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `game-stats-update` | `{ stats: GameStats }` | Mise à jour des statistiques après un match. |

---
