#!/bin/bash

if curl -X POST 'http://localhost:8181/auth/register' \
        -H "Content-Type: application/json" \
        -d '{
                "username": "pkachu",
                "password": "ComplexPassw0rd!",
                "email": "pik.achu@mail.com"
            }';
then
    echo ; echo
    echo "------------------------------------------------"
    echo
    curl -X POST 'http://localhost:8181/auth/login' \
        -H "Content-Type: application/json" \
        -d '{
                "password": "ComplexPassw0rd!",
                "identifier": "pik.achu@mail.com"
            }';
fi

# echo ; echo
# echo "------------------------------------------------"
# echo

# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -F "avatar=@./test_bad_magic_number.png" ;

# echo ; echo
# echo "------------------------------------------------"
# echo

# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -F "avatar=@./test_image.jpg" ;

# echo ; echo
# echo "------------------------------------------------"
# echo

# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -F "avatar=@./test_mutant.jpg" ;

# echo ; echo
# echo "------------------------------------------------"
# echo

# curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
#         -F "avatar=@./test_xss.jpg" ;

# echo ; echo
# echo "------------------------------------------------"
# echo
