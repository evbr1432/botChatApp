FROM node:lts-alpine

WORKDIR /usr/src/app


COPY package*.json ./

RUN npm install
RUN apk add --update npm
RUN apk add gcompat

COPY server.js .
COPY README.md .
COPY database.db .

RUN ls -l

CMD ["npm", "run", "prod"]
