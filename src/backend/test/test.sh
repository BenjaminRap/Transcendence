#!/bin/bash

# curl -f -X POST 'http://localhost:8181/auth/register' \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "username": "rcool",
#                 "password": "ComplexPassw0rd!",
#                 "email": "rouc.ool@mail.com"
#             }';

# result="$?" ;

# if [ $result -ne 0 ];
# then
#     echo ; echo
#     echo "------------------------------------------------"
#     echo
#     curl -X POST 'http://localhost:8181/auth/login' \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "password": "ComplexPassw0rd!",
#                 "identifier": "bbizarre"
#             }';
# fi

curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
        -H "Authorization \
        -F "avatar=@./test_image.jpg" ;

echo ; echo
echo "------------------------------------------------"
echo

curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
        -H "Authorization \
        -F "avatar=@./test_bad_magic_number.png" ;

echo ; echo
echo "------------------------------------------------"
echo

curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
        -H "Authorization \
        -F "avatar=@./test_mutant.jpg" ;

echo ; echo
echo "------------------------------------------------"
echo

curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
        -H "Authorization \
        -F "avatar=@./test_xss.jpg" ;

echo ; echo
echo "------------------------------------------------"
echo
