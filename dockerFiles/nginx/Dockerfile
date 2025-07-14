FROM nginx:1.29.0
WORKDIR /app
COPY ./nginx.conf /etc/nginx/conf.d/nginx.conf
RUN ["rm", "/etc/nginx/conf.d/default.conf"]
EXPOSE 8080
