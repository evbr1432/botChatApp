FROM node:lts-apline

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY ./public ./

RUN ls -l

EXPOSE 4000

CMD ("npm", "run", "prod")
