**POST /auth/register**

_Description :_ enregistre un nouvel utilisateur

_Mandatory headers :_
    Content-Type: application/json

_Body :_ JSON
    {
        "username": "string(20 char max), **Mandatory field**",
        "password": "string(8 char, 1 lower, 1 upper and 1 number minimum), **Mandatory field**",
        "email":    "string format email **Mandatory field**"
        "avatar":   "string link to image, **non-obligatory field**"
    }

_Possibles responses :_
✅ 201 Created:
    {
        success: true,
        message: 'User registered successfully',
        user: {
            "id": 1,
            "username": "myUsername",
            "email": "myMailExemple@gmail.com",
            "avatar": "https://avatar.com"
        }
        tokens: {
            "token": "eyJhbGciOiJIUzI1NiIs...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
        }
    }

❌ 400 Bad Request :
    {
        success: false,
        message: no body in the request
    }

❌ 400 Bad Request :
    {
        success: false,
        message: invalid username or password or email
    }

❌ 401 Unauthorized :
    {
        success: false,
        message: email or username already in use
    }

❌ 500 Internal Server Error :  _uniquement si la requete DB a echouee_
    {
        success: false,
        message: Internal Server Error
    }

-------------------------------------------------------------------------------------------------------------------------


**POST /auth/login**

_Description :_ Authentifie un utilisateur

_Mandatory headers :_
  Content-Type: application/json

_Body :_ JSON
  {
    "identifier": "string (, format email OU username) **Mandatory field**",
    "password": "string (, min 8 caractères **Mandatory field**)"
  }

_Possibles responses:_

✅ 200 Success
  {
    "success": true,
    "message": ""
    "user": {
      "id": 1,
      "username": "myName"
      "email": "user@example.com",
      "avatar": "https://avatar.com"
    }
    "tokens": {
        token: "eyJhbGciOiJIUzI1NiIs...",
        refresh_token: "eyJhbGciOiJIUzI1NiIs..."
    }
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "All fields are required"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Incorrect email / identifier or password"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET auth/refresh**

_Description :_ Renouvelle le token JWT lorsque le premier a expire

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 201 Success
  {
    "tokens": {
        token: "eyJhbGciOiJIUzI1NiIs...",
        refresh_token: "eyJhbGciOiJIUzI1NiIs..."
    }
    message: "Authentification token renewal successful"
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
