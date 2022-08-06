FROM node:16

RUN npm install --location=global npm@8.16.0
RUN rm -rf /root/.npm/_cacache/tmp

WORKDIR /bot

CMD npm start
