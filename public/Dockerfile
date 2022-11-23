FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package*.json ./
#ENTRYPOINT ["tail", "-f", "/dev/null"]
RUN ls -l 

RUN npm install

COPY . ./

CMD ls

#Might be useful for testing later
#RUN npm run build
#COPY  public/nodeServer.js dist/nodeServer.js
WORKDIR /usr/src/app/public

EXPOSE 8080

ENTRYPOINT ["node", "nodeServer.js"]
