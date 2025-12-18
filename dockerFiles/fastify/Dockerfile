FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

# copy package files
COPY ./package.json ./package.json

# install dependencies including prisma
RUN [ "npm", "install" ]

# create necessary directories
RUN [ "mkdir", "/app/backend" ]
RUN [ "mkdir", "-p", "/app/uploads/avatars" ]
RUN ["chmod", "-R", "755", "/app/uploads"]

# generate prisma before cleaning cache
ENV PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

COPY ./prisma ./prisma
RUN ["npx", "prisma", "generate"]


# clean cache
RUN [ "npm", "cache", "clean", "--force" ]

RUN [ "mkdir", "/app/dev/" ]
# copy entrypoint script
COPY    ./entrypoint.sh /entrypoint.sh
RUN     chmod +x /entrypoint.sh

EXPOSE 8181

ENTRYPOINT ["/entrypoint.sh"]
