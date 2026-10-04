.IGNORE: clean, fclean
.SILENT: clean, fclean
.PHONY: compile, build, compile-watch, up, all, stop, clean, fclean, clean-dep, re, fre

PROFILE = prod
DOCKER_DIR	=	./dockerFiles/
DOCKER_FILE	=	docker-compose.yaml
DOCKER_EXEC	=	docker compose -f $(DOCKER_DIR)$(DOCKER_FILE) --profile $(PROFILE)

all: install copy-tsconfig certificates build up

compile:
	npx tsc -p ./src/backend/tsconfig.json
	npx tsc-alias -p ./src/backend/tsconfig.json --resolve-full-paths --resolve-full-extension .js
	npx tsc --noEmit -p ./src/frontend/tsconfig.json
	npx @tailwindcss/cli -i ./input.css -o ./src/frontend/dev/public/css/tailwind.css


certificates:
	npx shx mkdir -p ./dockerFiles/secrets/ssl/
	$(DOCKER_EXEC) run --rm certificates

cp-scenes:
	npx shx cp -r ./src/backend/dev/scenes ./dockerFiles/fastify/app_src/dev/.

cp-env:
	npx shx cp .env.example	./dockerFiles/fastify/app_src/.env

gen-prisma-client:
	npx prisma generate --schema=./dockerFiles/fastify/prisma/schema.prisma

create-folders:
	npx shx mkdir -p ./dockerFiles/fastify/app_src/dev \
				./dockerFiles/fastify/app_src/uploads/avatars \
				./dockerFiles/fastify/databases/

build: create-folders cp-scenes cp-env gen-prisma-client compile

ifeq ($(PROFILE), prod)
	npx vite build
endif
	$(DOCKER_EXEC) build

compile-watch:
	npx concurrently \
		"tsc -p ./src/backend/tsconfig.json --watch" \
		"npx tsc-alias -p ./src/backend/tsconfig.json --resolve-full-paths --resolve-full-extension .js --watch" \
		"tsc --noEmit -p ./src/frontend/tsconfig.json --watch" \
		"tailwindcss/cli -i ./input.css -o ./src/frontend/dev/public/css/tailwind.css --watch"

up:
	$(DOCKER_EXEC) up -d
ifeq ($(PROFILE), prod)
	npx concurrently "$(DOCKER_EXEC) logs -f nginx" "$(DOCKER_EXEC) logs -f fastify-prod"
else
	npx concurrently "$(DOCKER_EXEC) logs -f vite" "$(DOCKER_EXEC) logs -f fastify-dev"
endif

install:
	npm install

copy-tsconfig:
	npx shx cp ./src/frontend/tsconfig.json ./dockerFiles/vite/

$(NAME): all

down:
	$(DOCKER_EXEC) down

stop:
	$(DOCKER_EXEC) stop

clean:
	-npx shx rm -rf ./dockerFiles/nginx/website/
	-npx shx rm -rf ./dockerFiles/fastify/app_src/dev

fclean:
	$(DOCKER_EXEC) down -v --remove-orphans --rmi local
	-npx shx rm ./package-lock.json
	-npx shx rm -rf ./dockerFiles/secrets/ssl/
	-npx shx rm -rf ./node_modules/

re: clean all
fre: fclean all
