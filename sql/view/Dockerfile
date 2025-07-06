FROM postgres:16-alpine

ENV POSTGRES_USER=user
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=mydb

COPY ./migrations/init.sql /docker-entrypoint-initdb.d/1-init.sql
COPY ./seeds/seed.sql /docker-entrypoint-initdb.d/2-seed.sql
COPY ./views/user_photos_view.sql /docker-entrypoint-initdb.d/3-view.sql