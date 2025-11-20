#! /bin/bash

cd ./src/backend/typescript/test || exit 1

./test.sh && cd - || exit 1