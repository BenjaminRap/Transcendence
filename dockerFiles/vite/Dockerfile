FROM node:24
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]


COPY ./package.json ./package.json
RUN [ "npm", "install", "vite@7.0.6" ]
RUN [ "npm", "install" ]
RUN [ "npm", "cache", "clean", "--force" ]

RUN [ "mkdir", "-p", "/app/public/" ]

COPY ./selfsigned/selfsigned.key /etc/ssl/private/selfsigned.key
COPY ./selfsigned/selfsigned.crt /etc/ssl/certs/selfsigned.crt

COPY ./vite.config.js ./vite.config.js

ENTRYPOINT [ "npm", "run", "start" ]
EXPOSE 443
