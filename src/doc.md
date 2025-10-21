Routes publiques — sans JWT

Aucune vérification nécessaire :

POST /auth/register

POST /auth/login

GET /status (vérifie si le serveur tourne)

GET /avatars/public/:id

GET /leaderboard (affiche le classement public)

ces routes doivent être accessibles même sans être connecté.



Routes utilisateur — avec JWT

Tout ce qui dépend d’un utilisateur connecté doit être protégé :

GET /users/me

POST /match/join

POST /chat/message

PUT /users/update

POST /friends/add

Ces routes nécessitent d’identifier l’utilisateur → JWT obligatoire.
