**GET suscriber/profile**

_Description :_ renvoie le profile de l'utilisateur courant

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
  {
    success: true,
    message: 'Profile retrieved successfully',
    user: SanitizedUser {
      id        string
      username  string
      avatar    string -> pour le moment
    }
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

**PUT suscriber/updatepassword**

_Description :_ permet de changer de mot de passe de l'utilisateur

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "currentPassword":    string
    "newPassword":        string  -> "doit respecter les regles du mot de passe valide"
    "confirmNewPassword": string  -> "doit etre similaire a newPassword"
  }

_Possibles responses:_

✅ 204 No Content

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token in the header"
  }

❌ 403 Forbidden :
  {
    "success": false,
    "message": "Invalid / missing or expred tokenKey in the body"
  } **il faut rappeler l'API POST /auth/verifypassword qui renvoie un token valide**

❌ 400 Bad Request :
  {
    "success": false,
    "message": "mauvais format password, manque ou mauvais confirmPassword, confirmChoice absent ou false"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found"
  }

❌ 409 Conflict :
  {
    "success": false,
    "message": "password similar to the current one or invalid_credential (mauvais current password)"
    "redirectTo": '/suscriber/updatepassword'
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**PUT suscriber/updateprofile**

_Description :_ permet d'update certaines donnes de l'user (username, avatar), soit plusieur d'un coup soit une seule. si plusieurs donnees sont demandees a etre mise a jour elles doivent toutes etre valide sinon aucune ne sera mise a jour et il faudra refaire une requete avec toutes les donnees valides

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "username": string -> "new username"
    "avatar":   string -> pour le moment
  }

_Possibles responses:_

✅ 200 Ok
  {
    success:  true,
    message: 'Profile successfully updated',
    redirectTo: '/suscriber/profile',
    user: {
      id,
      username,
      avatar,
    }
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token in the header",
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "Missing or invalid mandatory body content"
    "redirectTo": '/suscriber/profile'
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

-------------------------------------------------------------------------------------------------------------------------

**PUT suscriber/deleteaccount**

_Description :_ permet de supprimer son profile

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "tokenKey":           string  -> "token recupere via API /auth/verifypassword"
    "confirmChoice":      boolean -> true si l'utilisateur confirme son choix de changer mot de passe 
  }

_Possibles responses:_

✅ 204 No Content

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token in the header"
  }

❌ 403 Forbidden :
  {
    "success": false,
    "message": "Invalid / missing or expred tokenKey in the body"
  } **il faut rappeler l'API POST /auth/verifypassword qui renvoie un token valide**

❌ 400 Bad Request :
  {
    "success":    false,
    "message":    "confimChoice n'est pas true",
    "redirectTo": "suscriber/profile"
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

**GET suscriber/getstats**

_Description :_ recupere les stats en match de l'utilisateur

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
{
  success:  true,
  message:  "stats retrieved",
  stats: {
    gamesPlayed: number,
    gamesWon:    number,
    winRate:     number, 
  }
}

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token in the header"
  }

❌ 400 Bad Request :
  {
    "success":    false,
    "message":    "",
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
