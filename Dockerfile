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

#Back
CMD ["npm", "run", "dev"]

#Front
WORKDIR /usr/src/app/public
EXPOSE 8080
CMD ["node", "nodeServer.js"]

