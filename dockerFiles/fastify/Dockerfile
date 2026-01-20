FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

# copy package files
COPY ./package.json ./package.json
COPY ./app_src .

RUN ["chmod", "-R", "755", "/app/uploads"]

# install dependencies including prisma
RUN [ "npm", "install" ]

# generate prisma before cleaning cache
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY ./prisma ./prisma
RUN ["npx", "prisma", "generate"]

# clean cache
RUN [ "npm", "cache", "clean", "--force" ]

# copy entrypoint script
RUN [ "mkdir", "/app/scripts/" ]
COPY    ./entrypoint.sh /app/scripts/entrypoint.sh
RUN     chmod +x /app/scripts/entrypoint.sh

# EXPOSE 8181

ENTRYPOINT ["./scripts/entrypoint.sh"]
