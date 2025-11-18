FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

# Copier les fichiers package avant d'installer les dépendances
COPY ./package.json ./package.json
COPY ./prisma ./prisma

# Installer Fastify d'abord
RUN [ "npm", "install", "fastify@5.4.0" ]

# Installer toutes les dépendances incluant prisma
RUN [ "npm", "install" ]

# Générer Prisma AVANT de nettoyer le cache
RUN ["PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1"]
RUN ["npx", "prisma", "generate", "--schema=./prisma/schema.prisma"]

# Nettoyer le cache après
RUN [ "npm", "cache", "clean", "--force" ]

RUN [ "mkdir", "/app/backend" ]
RUN [ "mkdir", "-p", "/app/uploads/avatars" ]

RUN ["chmod", "-R", "755", "/app/uploads"]

COPY    ./entrypoint.sh /entrypoint.sh
RUN     chmod +x /entrypoint.sh

EXPOSE 8181

ENTRYPOINT ["/entrypoint.sh"]