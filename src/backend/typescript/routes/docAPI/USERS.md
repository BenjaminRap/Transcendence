**GET users/me**

_Description :_ renvoie le profile de l'utilisateur courant

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 OK
  {
    success: true,
    message: 'Profile retrieved successfully',
    user: {
        "id": 1,
        "username": myUsername,
        "email": myMail@mail.com,
        "avatar": "https://avatar.com" 
    }
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "Missing authentication token"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid token"
  }

❌ 404 Unauthorized :
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

**PUT users/me**

_Description :_ permet d'update certaines donnes de l'user (username, password, avatar), soit plusieur d'un coup soit une seule. si plusieurs donnees sont demandees a etre mise a jour elles doivent toutes etre valide sinon aucune ne sera mise a jour et il faudra refaire une requete avec des donnees valides

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 204 No Content
  {
    success: true,
    message: 'user update successful',
    user: {
        "id": 1,
        "username": myUsername,
        "email": myMail@mail.com,
        "avatar": "https://avatar.com" 
    }
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "Missing authentication token"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid token"
  }

❌ 404 Unauthorized :
  {
    "success": false,
    "message": "User not found"
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "missing or invalid data (il n'y a pas de donnee ou bien la donnee ne repond pas aux exigences du serveur par exemple username trop long ou password pas assez long)"
  }

❌ 409 Conflict :
  {
    "success": false,
    "message": "User with this email or username already exist"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

