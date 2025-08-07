FROM nginx:1.29.0
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf

RUN [ "mkdir", "-p", "/app/public/" ]

RUN ["rm", "/etc/nginx/conf.d/default.conf"]

COPY ./website/ ./public/
EXPOSE 443
