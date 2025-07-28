FROM nginx:1.29.0
WORKDIR /app

RUN [ "apt-get", "update", "-y" ]
RUN [ "apt-get", "clean" ]
RUN [ "rm", "-rf", "/var/lib/apt/lists*" ]

COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf
COPY ./selfsigned/selfsigned.key /etc/ssl/private/selfsigned.key
COPY ./selfsigned/selfsigned.crt /etc/ssl/certs/selfsigned.crt

RUN ["rm", "/etc/nginx/conf.d/default.conf"]
EXPOSE 443
