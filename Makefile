.IGNORE: clean, fclean
.SILENT: clean, fclean
.PHONY: restart-nginx, restart-fastify, compile, build, compile-watch, up, all, stop, clean, fclean, re, fre

DOCKER_DIR	=	./dockerFiles/
DOCKER_FILE	=	docker-compose.yaml
DOCKER_EXEC	=	docker compose -f $(DOCKER_DIR)$(DOCKER_FILE)


restart-nginx:
	$(DOCKER_EXEC) restart --no-deps nginx
	$(DOCKER_EXEC) logs -f nginx > ./dockerFiles/nginx/nginx.logs &

restart-fastify:
	$(DOCKER_EXEC) restart --no-deps fastify
	$(DOCKER_EXEC) logs -f fastify > ./dockerFiles/fastify/fastify.logs &

compile:
	tsc -p ./src/backend/tsconfig.backend.json
	tsc -p ./src/frontend/tsconfig.frontend.json
	npx @tailwindcss/cli -i ./input.css -o ./src/frontend/public/css/tailwind.css


certificates:
	mkdir -p ./dockerFiles/nginx/selfsigned/
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	  -keyout ./dockerFiles/nginx/selfsigned/selfsigned.key \
	  -out ./dockerFiles/nginx/selfsigned/selfsigned.crt \
	  -subj "/C=FR/ST=Auvergne-Rhône-Alpes/L=Brignais/O=42/CN=brappo"

build: compile
	$(DOCKER_EXEC) build

compile-watch:
	npx concurrently \
		"tsc -p ./src/backend/tsconfig.backend.json --watch" \
		"tsc -p ./src/frontend/tsconfig.frontend.json --watch" \
		"tailwindcss -i ./input.css -o ./src/frontend/public/css/tailwind.css --watch"

up:
	$(DOCKER_EXEC) up -d
	$(DOCKER_EXEC) logs -f nginx > ./dockerFiles/nginx/nginx.logs &
	$(DOCKER_EXEC) logs -f fastify > ./dockerFiles/fastify/fastify.logs &

all: certificates build up

stop:
	$(DOCKER_EXEC) stop

clean: stop
	-docker stop $(docker ps -qa) 2>/dev/null
	-docker rm $(docker ps -qa) 2>/dev/null
	-docker rmi -f $(docker images -qa) 2>/dev/null
	-docker volume rm $(docker volume ls -q) 2>/dev/null
	-docker network rm $(docker network ls -q) 2>/dev/null
	-rm ./src/frontend/public/javascript/*
	-rm ./src/backend/public/javascript/*

fclean: clean
	docker system prune -af

re: clean all
fre: fclean all
