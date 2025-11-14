**GET suscriber/profile**

_Description :_ renvoie le profile de l'utilisateur courant

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 OK
  {
    success: true,
    message: 'Profile retrieved successfully',
    user: SanitizedUser (**voir dans types/auth.types.ts**)
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "missing mandatory field in the body"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**PUT perso/updatepassword**

_Description :_ permet de changer de mot de passe

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "tokenKey" : "le_token_recupere_via_api_verifypassword" (**Mandatory field**)
    "newPassword": "string (min 12 caractères, Majuscule, minuscule, caractere special, nombre **Mandatory field**)"
  }


_Possibles responses:_

✅ 204 No Content

❌ 400 Bad Request :
  {
    "success": false,
    "message": "missing mandatory field in the body"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token in the header"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found"
  }

❌ 409 Conflict :
  {
    "success": false,
    "message": message qui explique quel champ dans le body ne respecte pas les regles du password
    "redirectTo": '/suscriber/updatepassword'
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**PUT suscriber/updateprofile**

_Description :_ permet d'update certaines donnes de l'user (username, avatar), soit plusieur d'un coup soit une seule. si plusieurs donnees sont demandees a etre mise a jour elles doivent toutes etre valide sinon aucune ne sera mise a jour et il faudra refaire une requete avec des donnees valides

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "username" : "pour changer username"
    "avatar": "pour changer avatar"
  }

_Possibles responses:_

✅ 200 Ok
  {
    success: true,
    message: 'user update successful',
    redirectTo: 'redirection proposee, perso/update en cas d'echec, perso/me en cas de reussite'
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "Missing mandatory body content"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid body content",
    "redirectTo": '/suscriber/updateprofile'
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found"
  }

❌ 409 Conflict :
  {
    "success": false,
    "message": "User with this email or username already exist",
    "redirectTo": '/suscriber/updateprofile'
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }
