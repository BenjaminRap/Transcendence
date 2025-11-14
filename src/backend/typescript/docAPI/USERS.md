

**PAS TOUT A JOUR (SAUF LES ROUTES)**




**GET users/search/id/:id**

_Description :_ renvoie le profile de l'utilisateur avec l'id passe en parametre

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 OK
  { ( _voir **dataStructure/usersStruct.js -> PublicProfileResponse** pour le schema de reponse_)
    success: true,
    message: 'Profile retrieved successfully',
    user: PersoProfile
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
    "message": "User not found",
    "user": PublicProfile
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET users//search/username/:username**

_Description :_ retourne un tableau avec 10 utilisateurs maximum venant de la DB dont le nom a une occurence avec le paramere username

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
  { ( _voir **dataStructure/usersStruct.js -> searchedUserResponse** pour le schema de reponse_)
    success: true,
    message: 'user update successful',
    usersFound: PublicProfile[]
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
    "message": "no profile found"
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "message expliquant pourquoi le parametre ne correspond pas au bon criteres de recherche"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

