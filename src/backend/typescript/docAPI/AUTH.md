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
        user: SanitizedUser (**voir dans types/auth.types.ts**)
        tokens: TokenPair (**voir dans types/tokenManager.types.ts**)
    }

❌ 400 Bad Request :
    {
        success: false,
        message: bad input (la saisie de l'utilisateur ne remplie pas les condition pour le mot de passe ou le nom ou l'email)
    }

❌ 409 Conflict :
    {
        success: false,
        message: A user with this email or username already exists
    }

❌ 500 Internal Server Error :  _uniquement si la requete DB a echouee_
    {
        success: false,
        message: Internal Server Error (NON PAS CA !!!!)
    }

-------------------------------------------------------------------------------------------------------------------------


**POST /auth/login**

_Description :_ Authentifie un utilisateur

_Mandatory headers :_
  Content-Type: application/json

_Body :_ JSON
  {
    "identifier": "string (format email OU username) **Mandatory field**",
    "password": "string (min 12 caractères, Majuscule, minuscule, caractere special, nombre **Mandatory field**)"
  }

_Possibles responses:_

✅ 200 Success
    {
        success: true,
        message: 'User registered successfully',
        user: SanitizedUser (**voir dans types/auth.types.ts**)
        tokens: TokenPair (**voir dans types/tokenManager.types.ts**)
    }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "All fields are required (il manque une ou plusieurs entrees utilisateur email/username et ou password)"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Incorrect email/identifier or password"
  }

❌ 500 Internal Server Error :  _uniquement si la requete DB a echouee_
    {
        success: false,
        message: Internal Server Error (NON PAS CA !!!!)
    }

-------------------------------------------------------------------------------------------------------------------------

**GET auth/refresh**

_Description :_ Renouvelle le token JWT lorsque le premier a expire

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
  {
    tokens: TokenPair (**voir dans types/tokenManager.types.ts**),
    message: "Authentification token renewal successful"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User Not Found"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET auth/verifyPassword**

_Description :_ Renouvelle le token JWT lorsque le premier a expire

_Mandatory headers :_
  Content-Type: application/json,
  Authorization: Bearer <TOKEN>

_Body :_ JSON
  {
    "password": "string (min 12 caractères, Majuscule, minuscule, caractere special, nombre **Mandatory field**)"
  }

_Possibles responses:_

✅ 200 Ok
  {
    success: true,
    tokens: TokenKey (**voir dans types/tokenManager.types.ts**, token jwt valable 5 minutes),
    message: "Password verification successful"
  }

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token"
  }

❌ 400 Bad Request :
  {
    "success": false,
    "message": "invalid password format"
  }

❌ 404 User Not Found :
  {
    "success": false,
    "message": "User Not Found"
  }

❌ 401 Conflict :
  {
    "success": false,
    "message": "Invalid password"
  }
