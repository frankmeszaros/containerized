FROM node:12

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/

COPY . /home/app

EXPOSE 3000

RUN npm install

CMD npm start
