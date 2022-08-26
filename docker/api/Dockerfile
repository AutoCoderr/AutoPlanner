FROM node:16

WORKDIR /bot

RUN rm -rf /root/.npm/_cacache/tmp
RUN npm install --location=global npm@8.18.0

CMD npm start
