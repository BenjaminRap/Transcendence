FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]


COPY ./package.json ./package.json
RUN [ "npm", "install", "fastify@5.4.0" ]
RUN [ "npm", "install" ]
RUN [ "npm", "cache", "clean", "--force" ]

RUN [ "mkdir", "/app/backend" ]

COPY ./prisma ./prisma

# Générer le client Prisma à la construction
RUN ["npx", "prisma", "generate"]

EXPOSE 8181

CMD npx prisma migrate dev --name init && npm run start
