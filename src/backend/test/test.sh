#!/bin/bash

# file to store tokens
TOKEN_FILE=".test_tokens"
accessTokens=()

# user data
usernames=("rcool" "pkachu" "slamech" "crapuce" "bbizarre" "rdoudou" "kdabra")
password="ComplexPassw0rd!"
emails=("rouc.ool@mail.com" "pik.achu@mail.com" "sal.ameche@mail.com" "car.apuche@mail.com" "bulb.izarre@mail.com" "rond.oudou@mail.com" kad.abra@mail.com)

init_test() {
    echo "Creation users"
    
    # check if tokens file already exists
    if [[ -f "$TOKEN_FILE" ]]; then
        return 0
    fi

    accessTokens=()
    
    for i in {0..6}; do
        accessTokens[$i]=$(curl -s -X POST 'http://localhost:8181/auth/register' \
                -H "Content-Type: application/json" \
                -d "{
                        \"username\": \"${usernames[i]}\",
                        \"password\": \"${password}\",
                        \"email\": \"${emails[i]}\"
                    }" | jq -r '.tokens.accessToken')
		echo "User ${usernames[i]} created"
    done
    
    printf '%s\n' "${accessTokens[@]}" > "$TOKEN_FILE"
}

# Function to load tokens from file
load_tokens() {
    if [[ ! -f "$TOKEN_FILE" ]]; then
        echo "launch init_test or login_test first"
        return 1
    fi

	accessTokens=()
    mapfile -t accessTokens < "$TOKEN_FILE"
	return 0
}

# function to test user login
login_test() {

    echo "Connection users"

	accessTokens=()
	for i in {0..6}; do
		echo "Login user ${usernames[i]}"

        accessTokens[$i]=$(curl -s -X POST 'http://localhost:8181/auth/login' \
                -H "Content-Type: application/json" \
                -d "{
                        \"identifier\": \"${usernames[i]}\",
                        \"password\": \"${password}\"
                    }" | jq -r '.tokens.accessToken')
		if [[ "${accessTokens[$i]}" == "null" ]]; then
			echo "Login failed for user ${usernames[i]}, init the DB"
			return 1
		fi
	done

    printf '%s\n' "${accessTokens[@]}" > "$TOKEN_FILE"

	local badPassword="WrongPassw0rd!"

    echo "Connection users with bad password"

	curl -X POST 'http://localhost:8181/auth/login' \
	    -H "Content-Type: application/json" \
	    -d "{
	            \"password\": \"${badPassword}\",
	            \"identifier\": \"${username[0]}\"
	        }";

}

# Function to test avatar upload
update_avatar_test() {
    echo "Test upload avatar"
	load_tokens || return 1

	echo "Upload a valid image as avatar"
	curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
			-H "Content-Type: multipart/form-data" \
			-H "Authorization: Bearer ${accessTokens[0]}" \
			-F "avatar=@./img_test/profile.png";
	echo ; echo

	echo "Upload an invalid image as avatar (bad magic number)"
	curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
			-H "Content-Type: multipart/form-data" \
			-H "Authorization: Bearer ${accessTokens[0]}" \
			-F "avatar=@./img_test/test_bad_magic_number.png";
	echo ; echo

	echo "Upload an invalid image as avatar (mutant file)"
	curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
			-H "Content-Type: multipart/form-data" \
			-H "Authorization: Bearer ${accessTokens[0]}" \
			-F "avatar=@./img_test/test_mutant.jpg";
	echo ; echo

	echo "Upload an invalid image as avatar (xss file)"
	curl -X PUT 'http://localhost:8181/suscriber/update/avatar' \
			-H "Content-Type: multipart/form-data" \
			-H "Authorization: Bearer ${accessTokens[0]}" \
			-F "avatar=@./img_test/test_xss.jpg";
	
	echo ; echo

	echo "Retrieve the default avatar"
	curl -X GET 'http://localhost:8181/static/public/avatarDefault.webp' 

}

# Function to test friend functionalities
friend_test() {
    echo "create new friend list for user 1"
	load_tokens || return 1

	for i in {1..6}; do
		echo "Add friend $i to user 1"
		curl -X POST "http://localhost:8181/friend/request/${i}" \
			-H "Content-Type: application/json" \
			-H "Authorization: Bearer ${accessTokens[0]}" \
			-d "{}"
		
		if (( $i % 2 == 0 )); then
			(( user = i - 1 ))
			echo "user=$user" ; echo "User $i try to accepts friend request from user 1"
			curl -X PUT "http://localhost:8181/friend/accept/1" \
				-H "Content-Type: application/json" \
				-H "Authorization: Bearer ${accessTokens[$user]}" \
				-d "{}"

		fi
		echo ; echo 
	done
}

delete_test() {
	echo "Delete users"
	load_tokens || return 1

	for i in {0..6}; do
		echo "Delete user $i"
		curl -X DELETE "http://localhost:8181/suscriber/delete/account" \
			-H "Content-Type: application/json" \
			-H "Authorization: Bearer ${accessTokens[i]}" \
			-d "{}"
	done
	rm -f "$TOKEN_FILE"
}	

# Parse command line arguments
for arg in "$@"; do
    case "$arg" in
        --init)
            init_test
            ;;
        --login)
            login_test
            ;;
        --updateAvatar)
            update_avatar_test
            ;;
        --friend)
            friend_test
            ;;
		--delete)
			delete_test
			;;
        --clean)
            rm -f "$TOKEN_FILE"
            echo "token file removed"
            ;;
        *)
            echo "Unknown mode: $arg"
            ;;
    esac
done
