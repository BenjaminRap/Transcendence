# Authentification OAuth 2.0 avec l'Intra 42

Le module demande de pouvoir se connecter en utilisant un service d'authentification `OAuth 2.0`. L'Intra de 42 étant compatible avec cette méthode, j'ai choisi de passer par ce fournisseur.

---

## 1. Génération du Code d'Autorisation (Frontend)

Avant tout, il faut générer un **code client**. Celui-ci sert à confirmer que l'utilisateur accepte que nous accédions à ses informations lorsqu'il clique sur le bouton **"Authorize"**.

Afin de faire cela, il faut rediriger le client vers la page d'autorisation de l'Intra. Une fois qu'il accepte, un `code` est généré et l'utilisateur est redirigé vers l'URL de redirection configurée.

<img src="https://media.discordapp.net/attachments/1169056184498659372/1448705286369181707/image.png?ex=693c3b6f&is=693ae9ef&hm=83b2963b40712f16511e7daee5ed7725a1bb2dfa8fd95c18debb0b8928ffa574&=&format=webp&quality=lossless&width=679&height=500">
### Configuration
Il est nécessaire de générer une clé API sur l'Intra et de configurer la `Redirect URI` (par exemple : `https://localhost:8080`). 

*(https://profile.intra.42.fr/oauth/applications pour check les API)*

Une fois l'application créée, nous obtenons :
- **Un UID** (Client ID)
- **Un Secret** (Client Secret)

### Flux de connexion
On peut alors accéder à l'URI suivante pour lancer le processus :
`https://api.intra.42.fr/oauth/authorize?client_id=[ID]&redirect_uri=[URI_REDIRECT_ENCODE]&response_type=code`

`https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-af74f109e86dea89dd52c8eda01a519312c9846c9f97ba190008540a9b19a530&redirect_uri=https://localhost:8080/api/auth/callback&response_type=code`

Une fois que la personne a cliqué sur **"Authorize"**, elle est redirigée vers :
`https://localhost:8080/?code=b9de6c539bbe56c637dabe70fbaa14c49a17503b4cd1b3902d8a3aecd05a808b`

Le `code` est maintenant présent dans les paramètres de l'URL.

---

## 2. Récupération du Token (Backend)

Ce code récupéré côté Frontend nous permet d'obtenir le token d'accès de l'utilisateur. 

**L'idéal est que le backend dispose d'une route dédiée** pour recevoir ce code, afin de réaliser une requête sécurisée vers `https://api.intra.42.fr/oauth/token`.

Voici ce que doit contenir le corps de la requête (`POST`) :

```json
{
  "grant_type": "authorization_code", // Mode de connection
  "client_id": "u-s4t2ud...", // Disponible dans les information de la cle API
  "client_secret": "s-s4t2ud...", // Disponible dans les information de la cle API
  "code": "fc0babef7...", // Code recu par le front
  "redirect_uri": "https://localhost:8080" // Disponible dans les information de la cle API
}
````

> ⚠️ **Sécurité :** Étant donné la présence du `client_secret` et de la réponse contenant le `token`, cette requête doit **forcément** passer par le serveur. Si ces éléments était manipulé côté Frontend, il représenterait une énorme faille de sécurité.

### Exemple de réponse (JSON)

```JSON
{
  "access_token": "2de9...", // Token qui nous interesse
  "token_type": "bearer",
  "expires_in": 7200,
  "refresh_token": "71329...",
  "scope": "public",
  "created_at": 1765461013
}
```

---

## 3. Récupération des informations

Afin d'obtenir les informations de l'utilisateur, nous pouvons maintenant effectuer un `fetch` sur `https://api.intra.42.fr/v2/me`.

Il faut utiliser le token reçu avec le type `Bearer` dans les headers de la requête.

### Point de vigilance

Les données retournées sont nombreuses. Attention : certains champs n'existent pas toujours selon les utilisateurs. Il est impératif de **vérifier la présence d'un champ** avant de tenter de l'extraire ou de l'utiliser dans votre application.








### UX transcendance.com

-> on peut pas copier de texte dans les formulaires (chiant pour les mots de passe)
-> quand on cat readme.md lorsqu'on est connecte ca affiche qu'on est en mode guest
