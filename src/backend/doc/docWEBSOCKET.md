
une socket client est necessaire lorsque l'utilisateur veut lancer un match ou bien si il veut visiter le profile d'un utilisateur

on ouvre une connexion en GUEST au client qui entre sur le site

si l'utilisateur n'est pas connecte a son compte et/ou n'est pas amis avec le profile qu'il visite alors il ne peut avoir ni la liste d'amis ni l'historique des matchs du user qu'il viste mais les stats (defaites - victoires - ratio) en plus de la photo de profile et du username seront notifies en cas de mise a jour

# connexion a la socket en GUEST :
``` ts
	const socket = io("http://localhost:8181/socket.io/", { // adresse en mode prod sans passer par proxy
	auth: {
		token: null // IMPORTANT !!
	},
	// Options a ajouter :
	transports: ["websocket"],	// use immediatly the ws protocole
	autoConnect: true,			// established connexion immediatly after the creation of the websocket in the backend side
	});
```

lorsque l'utilisateur se connecte a son profile ou bien se register sur le site, on met a jour la connexion websocket :
on recupere le jwt valide renvoye par le backend
on l'attache a la variable auth de la socket

on coupe la connexion de la socket et on se reconnect comme dans l'exemple ci-dessous
le backend prend en compte le token jwt et la nouvelle connexion automatiquement
l'utilisateur n'est plus en connexion GUEST

```ts
	// Fonction appelée juste après un Login réussi (réception du token API) COTE FRONT
	function handleLoginSuccess(newToken) {
		// 1. On met à jour le token pour la prochaine connexion
		socket.auth = { token: newToken };

		// 2. On coupe et on relance.
		// Le serveur va voir une "nouvelle" connexion, vérifier le token, 
		// et attacher le userId correct.
		socket.disconnect().connect();
	}
```

l'utilisateur est connecte a la websocket soit en GUEST soit sur son profile

# events from backend
| nom event | data received | response explanation |
|-----------|---------------|----------------------|
| user-status-change | userId: userId, status: 'online or offline' | user status |
| profile-update | user: { userID, username, avatar } | profile data |
| game-stats-update | stats: GameStats | player stats |
| account-deleted | void | les client qui recoivent cet event doivent se deconnecter |


# events from front
| nom event | data received | response explanation |
|-----------|---------------|----------------------|
| get-online-users | onlineUsers: number[] | full list of connected users |

# exemple
```ts
// 1. STATE : Variable pour stocker les IDs (Set pour performance)
let onlineUsers: Set<number> = new Set();

// Fonction d'initialisation à appeler une fois la socket connectée
function initOnlineStatusTracking(socket: any) {

    // 2. INITIALISATION : On demande qui est là maintenant (Pattern Request/Response)
    socket.emit("get-online-users", (ids: number[]) => {
        onlineUsers = new Set(ids);
        console.log("Liste initiale chargée :", onlineUsers);
    });


    socket.on("profile-update", (user: {userID, username, avatar }) => {
        console.log(user);
    })


    // 3. TEMPS RÉEL : On écoute les changements
    socket.on("user-status-change", (data: { userId: number, status: 'online' | 'offline' }) => {
        if (data.status === 'online') {
            onlineUsers.add(data.userId);
        } else {
            onlineUsers.delete(data.userId);
        }
        console.log(`Mise à jour status user ${data.userId} : ${data.status}`);
    });
}

// 4. UTILITAIRE : Fonction pour vérifier si un joueur est en ligne
function isUserOnline(userId: number): boolean {
    return onlineUsers.has(userId);
}

// Lancement
// initOnlineStatusTracking(socket);
```

strategie front

appeler get-online-users une fois au demarrage
tenir un set des ids en ligne a jour lors d'event user-status-change (online / offline) et lors de nouvelle connexion / deconnexion

