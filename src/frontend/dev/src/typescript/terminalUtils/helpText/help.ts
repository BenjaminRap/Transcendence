export let HELP_MESSAGE_NOT_LOG = `
Help - Utilisation du terminal

Comment exécuter une commande :
- Tapez une commande, puis appuyez sur Entrée.
- Le terminal enverra une réponse; chaque réponse commence par le caractère ">".

Statut actuel :
- Vous êtes actuellement connecté en tant que "guest".

Créer un compte (register) :
- Tapez: register
- Appuyez sur Entrée et suivez les instructions affichées pour choisir un nom et un mot de passe.

Se connecter (login) :
- Tapez login
- Appuyez sur Entrée et suivez les instructions pour fournir vos identifiants..

Si tu es un edudiant de 42, tu peux egalement te connecter via l'authentification 42 en tapant 42 !

Vous pouvez tout de meme jouer a pong en tant que guest !

Commandes utiles :
- help : affiche cette aide
- clear: vide l'écran
- login / register: se connecter ou créer un compte
- pong : jouer a pong en tant que guest
- 42 : se connecter via l'authentification 42
`


export let HELP_MESSAGE = `
Help - Utilisation du terminal

Rappel comment exécuter une commande :
- Tapez une commande, puis appuyez sur Entrée.
- Le terminal enverra une réponse; chaque réponse commence par le caractère ">".

Vous etes maintenant connecte et avez debloquer le plein potentiel du terminal !

Vous pouvez profiter de votre compte sur pong ainsi qu'acceder aux fonctionnalites suivantes :
- profile : afficher votre profil (ex: profile)
- profile <username> : afficher le profil d'un autre utilisateur (ex: profile sben-rho)

Vous disposez egalement d'une environnement de fichiers virtuel avec les commandes suivantes :
- ls : lister les fichiers et dossiers dans le répertoire courant
	- un dossier fini toujours par un '/' (ex: documents/)
- cd <dossier> : changer de répertoire (ex: cd documents)
- cat <fichier> : afficher le contenu d'un fichier (ex: cat readme.txt)
`

/*
		new Command('kill', 'Terminate a process', 'kill [process_name]', killCommand),

		new Command('register', 'Register a new user', 'register [text]', registerInput),
		new Command('login', 'Login to your account', 'login [email] [password]', loginInput),
		new Command('42' , 'Authenticate with OAuth 42', '42', OauthCommand),



		new Command('cd', 'Change the current directory', 'cd [directory]', cdCommand),
		new Command('ls', 'List directory contents', 'ls', lsCommand),
		new Command('pwd', 'Print working directory', 'pwd', pwdCommand),
		new Command('cat', 'Concatenate and display file content', 'cat [file]', catCommand),
		new Command('whoami', 'Display the current username', 'whoami', whoamiCommand),
		new Command('logout', 'Logout from your account', 'logout', RequestBackendModule.logout),
		new Command('pong', 'Launch the Pong game', 'pong', pongCommand),
		new Command('rm', 'Remove files or directories', 'rm [file]', rmCommand),

*/

export namespace CommandHelpMessage {
	export let HELP_ECHO = 
	`echo - Affiche une ligne de texte
> Utilisation :
	> echo [TEXTE]
> Exemple : 
	> "user@terminal:/home/user$ echo salut"
	> "> salut"`

	export let HELP_PROFILE =
	`profile - affiche un profile (Historique de match, Victoire, Defaite ...)
> Utilisation :
	> profile [pseudo] 
		- Pour voir le profile d'un utilisateur
	> profile
		- Pour voir son propre profile (Vous devez etre connecter)
> Exemple : 
	> "user@terminal:/home/user$ profile sben-rho"
	> "> Profil ouvert. Tapez "kill profile" pour le fermer."
> Astuce :
	> Si vous taper le debut d'un pseudo et que vous appuyer sur TAB, une liste de 10 utilisateur max avec un pseudo similaire apparait !`

	export let HELP_CLEAR = 
	`clear - Efface l'écran du terminal
> Utilisation :
	> clear
> Exemple : 
	> "user@terminal:/home/user$ clear"`	
} 