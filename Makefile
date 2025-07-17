.IGNORE: fre, re, fclean, clean, stop, all, up, build, restart-nginx
.SILENT: fre, re, fclean, clean, stop, all, up, build, restart-nginx
DOCKER_DIR	=	./dockerFiles/
DOCKER_FILE	=	docker-compose.yaml
DOCKER_EXEC	=	docker compose -f $(DOCKER_DIR)$(DOCKER_FILE)


restart-nginx:
	$(DOCKER_EXEC) restart --no-deps nginx
	$(DOCKER_EXEC) logs -f nginx > ./dockerFiles/nginx/nginx.logs &

restart-fastify:
	$(DOCKER_EXEC) restart --no-deps fastify
	$(DOCKER_EXEC) logs -f fastify > ./dockerFiles/fastify/fastify.logs &

build:
	$(DOCKER_EXEC) build

up:
	$(DOCKER_EXEC) up -d
	$(DOCKER_EXEC) logs -f nginx > ./dockerFiles/nginx/nginx.logs &
	$(DOCKER_EXEC) logs -f fastify > ./dockerFiles/fastify/fastify.logs &

all: build up

stop:
	$(DOCKER_EXEC) stop

clean: stop
	-docker stop $(docker ps -qa) 2>/dev/null
	-docker rm $(docker ps -qa) 2>/dev/null
	-docker rmi -f $(docker images -qa) 2>/dev/null
	-docker volume rm $(docker volume ls -q) 2>/dev/null
	-docker network rm $(docker network ls -q) 2>/dev/null

fclean: clean
	docker system prune -af

re: clean all
fre: fclean all
