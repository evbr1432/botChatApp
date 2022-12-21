FROM node:lts-alpine

WORKDIR /usr/src/app


#COPY package*.json ./
COPY . ./

RUN npm install
RUN apk add --update npm
RUN apk add gcompat

#COPY server.js .
#COPY README.md .
#COPY database.db .

RUN ls -l

#Front
#WORKDIR /usr/src/app/public
EXPOSE 5000
#CMD ["node", "nodeServer.js"]

CMD ["npm", "run", "prod"]
