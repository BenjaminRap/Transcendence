**POST friend/request/:id**

_Description :_ envoie une demande d'ami

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Mandatory url param :_
	id:

_Possibles responses:_

✅ 201 Created
  {
    success: true,
    message: 'Friend request successfully sent'
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

❌ 400 Bad Request :
  {
    "success": false,
    "message": "parametre id invalid (ex: id: -1) / deja ami / demande deja envoye / demande envoyee a sois meme"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**PUT friend/accept/:id**

_Description :_ accepter une demande d'ami qui est en mode pending

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Mandatory url param :_
	id:

_Possibles responses:_

✅ 204 No Content

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

❌ 400 Bad Request :
  {
    "success": false,
    "message": "parametre id invalid (ex: id: -1) / deja ami / pas de demande en attente / accepter une demande pour sois meme"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**PUT friend/delete/:id**

_Description :_ supprimer une demande d'amis ou supprimer un ami

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Mandatory url param :_
	id:

_Possibles responses:_

✅ 204 No Content

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

❌ 400 Bad Request :
  {
    "success": false,
    "message": "parametre id invalid (ex: id: -1) / pas de demande en attente ou de lien d'amitie / supprimer sa propre amitie"
  }

❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET friend/search/myfriends**

_Description :_ rechercher sa liste d'amis

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
{
	success: true,
	message: 'Friendlist found'
	friendList: [
		{
			id:         string,
			username:   string,
			avatar:     string
		},
		{
			id:         string,
			username:   string,
			avatar:     string
		} ...
	]
}

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found or No friends found"
  }

 ❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------

**GET friend/search/pendinglist** -> rechercher les demandes en attente

_Description :_ rechercher sa liste d'amis

_Mandatory headers :_
  Content-Type:   application/json,
  Authorization:  Bearer <TOKEN>

_Possibles responses:_

✅ 200 Ok
{
	success: true,
	message: 'Friendlist found'
	friendList: [
		{
			id:         string,
			username:   string,
			avatar:     string
		},
		{
			id:         string,
			username:   string,
			avatar:     string
		} ...
	]
}

❌ 401 Unauthorized :
  {
    "success": false,
    "message": "Invalid or missing token"
  }

❌ 404 Not Found :
  {
    "success": false,
    "message": "User not found or No friends found"
  }

 ❌ 500 Internal Server Error :
  {
    "success": false,
    "message": "Internal Server Error"
  }

-------------------------------------------------------------------------------------------------------------------------
