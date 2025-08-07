.IGNORE: clean, fclean
.SILENT: clean, fclean
.PHONY: restart-nginx, restart-fastify, compile, build, compile-watch, up, all, stop, clean, fclean, re, fre

PROFILE = prod
DOCKER_DIR	=	./dockerFiles/
DOCKER_FILE	=	docker-compose.yaml
DOCKER_EXEC	=	docker compose -f $(DOCKER_DIR)$(DOCKER_FILE) --profile $(PROFILE)

compile:
	npx tsc -p ./src/backend/tsconfig.backend.json
	npx tsc --noEmit -p ./src/frontend/tsconfig.frontend.json
	npx @tailwindcss/cli -i ./input.css -o ./src/frontend/public/css/tailwind.css


certificates:
	mkdir -p ./dockerFiles/secrets/ssl/
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	  -keyout ./dockerFiles/secrets/ssl/selfsigned.key \
	  -out ./dockerFiles/secrets/ssl/selfsigned.crt \
	  -subj "/C=FR/ST=Auvergne-Rhône-Alpes/L=Brignais/O=42/CN=brappo"

build: compile
ifeq ($(PROFILE), prod)
	npx vite build
endif
	$(DOCKER_EXEC) build

compile-watch:
	npx concurrently \
		"tsc -p ./src/backend/tsconfig.backend.json --watch" \
		"tsc --noEmit -p ./src/frontend/tsconfig.frontend.json --watch" \
		"tailwindcss -i ./input.css -o ./src/frontend/public/css/tailwind.css --watch"

up:
	$(DOCKER_EXEC) up -d
ifeq ($(PROFILE), prod)
	$(DOCKER_EXEC) logs -f nginx > ./dockerFiles/nginx/nginx.logs &
else
	$(DOCKER_EXEC) logs -f vite > ./dockerFiles/vite/vite.logs &
endif
	$(DOCKER_EXEC) logs -f fastify > ./dockerFiles/fastify/fastify.logs &

install:
	npm install

all: install certificates build up

$(NAME): all

stop:
	$(DOCKER_EXEC) stop

clean: stop
	-docker stop $(docker ps -qa) 2>/dev/null
	-docker rm $(docker ps -qa) 2>/dev/null
	-docker rmi -f $(docker images -qa) 2>/dev/null
	-docker volume rm $(docker volume ls -q) 2>/dev/null
	-docker network rm $(docker network ls -q) 2>/dev/null

fclean: clean
	-docker system prune -af
	-rm -rf ./dockerFiles/nginx/website/
	-rm -rf ./src/backend/javascript/*
	-rm -r ./dockerFiles/secrets/ssl/*

re: clean all
fre: fclean all
