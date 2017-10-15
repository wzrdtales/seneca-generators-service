FROM node:8
ENV TERM=xterm

USER node
WORKDIR /home/node

COPY package.json index.js config.js /home/node/
COPY lib /home/node/lib
COPY node_modules /home/node/node_modules

EXPOSE 5000
CMD [ "npm", "start" ]
