FROM node:8-alpine

WORKDIR /src

COPY ./package.json ./
RUN npm install

COPY ./constant ./constant
COPY ./user-subscribe.js ./
COPY ./user-publish.js ./
COPY ./config ./config

CMD ["../bin/sh", "-c", "node user-subscribe.js & node user-publish.js"]

