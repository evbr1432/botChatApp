FROM node:lts-alpine
WORKDIR /usr/src/app
COPY public/package.json ./
RUN ls -l
RUN npm install
COPY public ./
RUN ls-l
RUN npm run build
COPY public/client.js dist/client.js
WORKDIR /usr/src/app/dist
EXPOSE 8080
CMD [ "node", "client.js"]