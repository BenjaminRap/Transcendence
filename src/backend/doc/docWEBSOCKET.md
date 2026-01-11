
# envoyer une notification a la room watch-ID lors d'un changement de profile

``` ts
	export type ClientToServerEvents = {
		[T in ClientMessage]: ClientMessageData<T> extends undefined ?
			() => void :
			(data: ClientMessageData<T>) => void;
	} & {
		"get-online-users": (callback: (users: number[]) => void) => void;
		// NOUVEAUX EVENTS
		"watch-profile": (data: { userId: number }) => void;
		"unwatch-profile": (data: { userId: number }) => void;
	};



    // ----------------------------------------------------------------------------- //
    private initSocket()
    {
        this.initMiddleware();
        this.io.on('connection', (socket : DefaultSocket) => {
            this.handleConnection(socket);

            socket.on("join-matchmaking", () => {
                this.handleMatchMakingRequest(socket);
            });

            socket.on("get-online-users", (callback) => {
                this.handleGetStatus(socket, callback);
            });

            // --- DEBUT AJOUT ---
            socket.on("watch-profile", (data) => {
                const targetRoom = `watching-user-${data.userId}`;
                socket.join(targetRoom);
            });

            socket.on("unwatch-profile", (data) => {
                const targetRoom = `watching-user-${data.userId}`;
                socket.leave(targetRoom);
            });
            // --- FIN AJOUT ---

            socket.once("disconnect", () => {
                this.handleDisconnect(socket);
            });
        });
    }

    // ...existing code...

    // ----------------------------------------------------------------------------- //
    // Nouvelle méthode pour notifier le changement de profil BACKEND
    static notifyProfileUpdate(userId: number, updatedProfileData: any): void
    {
        if (SocketEventController.socketInstance) {
            // 1. Notifier ceux qui regardent le profil (Room "watching")
            const watchingRoom = `watching-user-${userId}`;
            SocketEventController.socketInstance.io.to(watchingRoom).emit('profile-update', { 
                user: updatedProfileData 
            });

            // 2. Notifier l'utilisateur lui-même (Room "perso") 
            // Utile s'il a le site ouvert sur plusieurs onglets/appareils
            SocketEventController.sendToUser(userId, 'profile-update', { user: updatedProfileData });
        }
    }



	// Dans votre route de mise à jour de profil/avatar
	async updateAvatar(...) {
		// ... logique de mise à jour DB ...
		
		const updatedUser = ...; // L'objet User mis à jour
		
		// Hop, on notifie tout le monde concerné en une ligne
		SocketEventController.notifyProfile// Dans votre route de mise à jour de profil/avatar
	async updateAvatar(...) {
		// ... logique de mise à jour DB ...
		
		const updatedUser = ...; // L'objet User mis à jour
		
		// Hop, on notifie tout le monde concerné en une ligne
		SocketEventController.notifyProfile
```




une socket client est necessaire lorsque l'utilisateur veut lancer un match ou bien si il veut visiter le profile d'un utilisateur

on ouvre une connexion en GUEST au client qui entre sur le site

si l'utilisateur n'est pas connecte a son compte et/ou n'est pas amis avec le profile qu'il visite alors il ne peut voir ni la liste d'amis ni l'historique des matchs du user qu'il viste mais il peut voir les stats (defaites - victoires - ratio) en plus de la photo de profile et du username

# connexion a la socket en GUEST :
``` ts
	const socket = io("http://localhost:8181/socket.io/", { // adresse en mode prod sans passer par proxy
	auth: {
		token: null // IMPORTANT !!
	},
	// Options a ajouter :
	transports: ["websocket"],	// use immediatly the wss protocole
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

les visiteurs peuvent desormais voir son statut connecte
l'utilisateur peut voir le profile complet de ses amis


# LES EVENTS A ECOUTER COTE FRONT

	- user-status-change
		-> lorsqu'une connexion socket est initialisee depuis le front apres une connexion a la route /api/auth/register && /api/auth/login
		-> lorsqu'un utilisateur se deconnecte (ferme l'onglet)

# ecouter un event cote front:

```ts
	import { io } from "socket.io-client";

	// Récupération du token (ex: depuis localStorage ou un store)
	const userToken = localStorage.getItem('jwt_token');

	const socket = io("http://localhost:8181", {
	auth: {
		token: userToken
	},
	transports: ["websocket"], 
	autoConnect: true
	});

	// a partir d'ici une connection websocket existe entre le front et le back
	// on peut ecouter des events provenant du back ou bien emmetre des events au back

	// 1. ÉCOUTER (Recevoir des données du serveur)
    // Syntaxe : socket.on('nom-event', callback_function)

	// 2. ÉMETTRE (Envoyer des données au serveur)
    // Syntaxe : socket.emit('nom-event', data)

```

| nom event | data | received or emit |
|-----------|------|------------------|
| user-status-change | userId: userId, status: 'online or offline' | received from back |
| profile-update | user: { userID, username, avatar } | received from back |
| game-stats-update | stats: GameStats | receive from back new player stats |