une socket client est necessaire lorsque l'utilisateur veut lancer un match ou bien si il veut visiter le profile d'un utilisateur

OPTION LA PLUS SIMPLE:
si l'utilisateur doit obligatoirement etre connecte a son compte pour visiter le profile des autres utilisateurs alors il n'a besoin de la websocket que lorsqu'il veut jouer un match en tant que GUEST (la websocket ne sert que lorsqu'un match est joue)

OPTION LA PLUS PROPRE:
si l'utilisateur a le droit de voir les profiles des autres utilisateurs sans etre lui meme connecte alors il a besoin d'une connection websocket des qu'il arrive sur le site (pour voir les mises a jour du profile qu'il visite comme la photo de profile et username)

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

si l'utilisateur se connecte a son profile alors qu'il a deja une connexion etablie en GUEST (ou bien qu'il se cree un compte alors qu'il est GUEST)

```ts
	// Fonction appelée juste après un Login réussi (réception du token API)
	function handleLoginSuccess(newToken) {
		// 1. On met à jour le token pour la prochaine connexion
		socket.auth = { token: newToken };

		// 2. On coupe et on relance.
		// Le serveur va voir une "nouvelle" connexion, vérifier le token, 
		// et attacher le userId correct.
		socket.disconnect();
		socket.connect();
	}
```


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





	// ...existing code...

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
    // Nouvelle méthode pour notifier le changement de profil
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



# LES EVENTS A ECOUTER COTE FRONT

	- user-status-change
		-> lorsqu'une connexion socket est initialisee depuis le front apres une 	connexion a la route /api/auth/register && /api/auth/login
		-> lorsqu'un utilisateur se deconnecte via /api/auth/logout

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

	

```