

**PAS TOUT A JOUR (SAUF LES ROUTES)**




**GET users/search/id/:id**

_Description :_ renvoie le profile de l'utilisateur avec l'id passe en parametre

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 OK
  {
    success:  true,
    message:  'Profile retrieved successfully',
    user: {
      id,       -> string
      username, -> string
      avatar    -> string
    }
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token JWT"
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "invalid input in the body"
  }


❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found or suscriber not found",
x  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET users/search/username/:username**

_Description :_ retourne un tableau avec 10 utilisateurs maximum venant de la DB dont le nom a une occurence avec le paramere username

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Mandatory url param :_
  username: 

_Possibles responses:_

✅ 200 Ok
  {
    success: true,
    message: 'user update successful',
    usersFound: [
      {
        id,       -> string
        username, -> string
        avatar    -> string        
      },
      {
        id,       -> string
        username, -> string
        avatar    -> string        
      }, ...
    ] **tableau de users**
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token JWT"
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "invalid username format in the body"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "no profile found"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

