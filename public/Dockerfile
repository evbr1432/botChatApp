FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
ENTRYPOINT ["tail", "-f", "/dev/null"]
RUN ls -l 

RUN npm install

COPY . ./

RUN ls -l


#Might be useful for testing later
#RUN npm run build
COPY  ./nodeServer.js ./dist/nodeServer.js
WORKDIR /usr/src/app/dist

EXPOSE 8080

ENTRYPOINT ["node", "nodeServer.js"]
