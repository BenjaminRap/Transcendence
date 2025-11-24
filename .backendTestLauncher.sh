#! /bin/bash

cd ./src/backend/test || exit 1 ;

./test.sh #>output_backend_test.txt 2>&1 ;

cd - || exit 1 ;