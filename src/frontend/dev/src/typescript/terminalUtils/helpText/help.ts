export let HELP_MESSAGE_NOT_LOG = `
=== Help - Utilisation du terminal ===

Comment exécuter une commande :
- Tapez une commande, puis appuyez sur Entrée.
- Le terminal enverra une réponse; chaque réponse commence par le caractère ">".

Statut actuel :
- Vous êtes actuellement pas connecté.

Créer un compte (register) :
- Tapez: register
- Appuyez sur Entrée et suivez les instructions affichées.

Se connecter (login) :
- Tapez login
- Appuyez sur Entrée et suivez les instructions.

Si vous êtes un étudiant de 42, vous pouvez également vous connecter via l'authentification 42 en tapant 42 !

Vous pouvez tout de même jouer à pong avec la commande 'pong' en tant que guest !

Commandes utiles :
- help : affiche cette aide

Astuces : 
	Chaque commande suivie de '--help' affichera une aide contextuelle.`


export let HELP_MESSAGE = `
Help - Utilisation du terminal

Rappel comment exécuter une commande :
- Tapez une commande, puis appuyez sur Entrée.
- Le terminal enverra une réponse; chaque réponse commence par le caractère ">".

Vous etes maintenant connecte et avez debloquer le plein potentiel du terminal !

Vous pouvez profiter de votre compte sur pong ainsi qu'acceder aux fonctionnalites suivantes :
- profile : afficher votre profil (ex: profile)
- profile <username> : afficher le profil d'un autre utilisateur (ex: profile sben-rho)

Vous pouvez vous deconnecter avec la commande 'logout'
`

/*

		new Command('cd', 'Change the current directory', 'cd [directory]', cdCommand),
		new Command('ls', 'List directory contents', 'ls', lsCommand),
		new Command('pwd', 'Print working directory', 'pwd', pwdCommand),
		new Command('cat', 'Concatenate and display file content', 'cat [file]', catCommand),
		new Command('whoami', 'Display the current username', 'whoami', whoamiCommand),
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

	export let HELP_REGISTER =
	`register - Crée un nouveau compte
> Utilisation :
	> register
> Exemple :
	> "user@terminal:/home/user$ register"
	> "Mail :"
		- Entrer votre adresse e-mail puis appuyer sur Entrée
	> "Nom d'utilisateur :"
		- Entrer votre nom d'utilisateur puis appuyer sur Entrée
	> "Mot de passe :"
		- Entrer votre mot de passe puis appuyer sur Entrée
	> "Le compte a été créé avec succès."
> Vous serez connecté automatiquement.`

	export let HELP_LOGIN =
	`login - Se connecter à votre compte
> Utilisation :
	> login
> Exemple :
	> "user@terminal:/home/user$ login"
	> "Identifiant :"
		- Entrer votre adresse e-mail ou nom d'utilisateur puis appuyer sur Entrée
	> "Mot de passe :"
		- Entrer votre mot de passe puis appuyer sur Entrée
	> "Connexion réussie ! Tapez **help** pour de nouvelles instructions."`

	export let HELP_42 = 
	`> 42 - Authentification via OAuth 42
> Utilisation :
	> 42
> Exemple :
	> "user@terminal:/home/user$ 42"
	> "Vous serez redirigé vers la page de connexion 42."`

	export let HELP_LOGOUT = 
	`> logout - Se déconnecter de votre compte
> Utilisation :
	> logout
> Exemple :
	> "user@terminal:/home/user$ logout"
	> "Déconnexion réussie !"`

	export let HELP_PONG =
	`> pong - Lancer le jeu Pong
> Utilisation :
	> pong
> Exemple :
	> "user@terminal:/home/user$ pong"
	> "Pong lancé !"`
}