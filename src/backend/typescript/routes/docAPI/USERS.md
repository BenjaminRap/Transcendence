**GET auth/me**

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
