FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

COPY ./package.json ./package.json
RUN [ "npm", "install" ]
RUN [ "npm", "install", "fastify" ]
RUN [ "npm", "cache", "clean", "--force" ]

RUN [ "mkdir", "/app/backend" ]

ENTRYPOINT [ "npm", "run", "start" ]
EXPOSE 8181
