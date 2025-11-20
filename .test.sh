#!/bin/bash

# curl -X POST 'http://localhost:8181/auth/register' \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "username": "pkachu",
#                 "email": "pik.achu@mail.com"
#             }';

# echo ; echo
# echo "------------------------------------------------"
# echo

# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -H "Authorization:" \
#         -F "avatar=@/home/fberthou/Downloads/id_recto.png" ;

# echo ; echo
# echo "------------------------------------------------"
# echo
# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -H "Authorization:" \
#         -F "avatar=@./.test_corrupt_format.png " ;

# echo ; echo
# echo "------------------------------------------------"
# echo

curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
        -H "Authorization:" \
        -F "avatar=@./.test_xss.jpg " ;

echo ; echo
echo "------------------------------------------------"
echo
