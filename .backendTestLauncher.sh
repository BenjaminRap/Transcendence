#! /bin/bash

cd ./src/backend/test || exit 1 ;

./test.sh $1

cd - || exit 1 ;