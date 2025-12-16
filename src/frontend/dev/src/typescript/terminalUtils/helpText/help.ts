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