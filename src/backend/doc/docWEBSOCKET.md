
# 🔌 WebSocket Documentation

La communication en temps réel (WebSocket) est utilisée pour :
- Le Matchmaking et le jeu.
- Le suivi du statut en ligne des utilisateurs.
- Les mises à jour de profil en temps réel.
- Les notifications de demandes d'amis.

---

## 🚀 Connexion

### 1. Mode Invité (Guest)
Par défaut, tout visiteur se connecte en mode "Guest". Cela permet d'accéder aux fonctionnalités publiques sans être authentifié.

```typescript
const socket = io("http://localhost:8181", {
    path: "/socket.io/",
    transports: ["websocket"], // Évite le fallback polling
    auth: {
        token: null // IMPORTANT : null pour guest
    },
    autoConnect: true,
});
```

### 2. Mode Authentifié
Une fois l'utilisateur connecté via l'API REST (Login/Register), le client doit mettre à jour la connexion WebSocket avec le token JWT reçu.

```typescript
// Fonction à appeler après une connexion réussie (API REST)
function handleLoginSuccess(newToken: string) {
    // 1. Mettre à jour le token d'authentification
    socket.auth = { token: newToken };

    // 2. Reconnecter la socket pour prendre en compte le token côté serveur
    // Le serveur associera alors cette socket au userId correspondant
    socket.disconnect().connect();
}
```

---

## 📡 Événements Client (Emit)

Ces événements sont envoyés par le **Frontend** vers le **Backend**.

| Nom de l'événement | Données envoyées | Description |
|-------------------|------------------|-------------|
| `join-matchmaking` | `void` | Demande à rejoindre la file d'attente pour un match. |
| `get-online-users` | `callback: (ids: number[]) => void` | Demande la liste des IDs des utilisateurs connectés (Req/Res pattern). |
| `watch-profile` | `profileIds: number[]` | S'abonne aux mises à jour (ex: status, avatar) d'une liste de profils spécifiques. |
| `unwatch-profile` | `profileIds: number[]` | Se désabonne des mises à jour de ces profils. |

---

## 📥 Événements Serveur (On)

Ces événements sont envoyés par le **Backend** vers le **Frontend**.

### Statut et Profil
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `user-status-change` | `{ userId: number, status: 'online' \| 'offline' }` | Notifie qu'un ami ou un profil surveillé vient de se connecter/déconnecter. |
| `profile-update` | `{ user: PublicUser }` | Notifie qu'un profil surveillé a été modifié (avatar, username). |
| `account-deleted` | `void` | Notifie que le compte courant a été supprimé (provoque une déconnexion forcée). |

### Amis
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `friend-status-update` | `{ requester: User, status: 'PENDING' }` | **Reçu par le destinataire** lors d'une nouvelle demande d'ami. |
| `friend-status-update` | `{ friendProfile: User, status: 'ACCEPTED' }` | **Reçu par le demandeur** lors de l'acceptation de sa demande. |

### Jeu (Stats)
| Nom de l'événement | Données reçues | Description |
|-------------------|----------------|-------------|
| `game-stats-update` | `stats: GameStats` | Mise à jour des statistiques après un match. |

---
