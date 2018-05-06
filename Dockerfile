FROM node:9.11.1

RUN apt-get update
RUN npm install -g yarnpkg
RUN mkdir -p /home/app

WORKDIR /home/app

COPY package.json /home/app/
COPY yarn.lock /home/app/

RUN yarn install --production --pure-lockfile
COPY . /home/app

RUN ["yarn", "build:prod"]
CMD ["yarn", "start:prod"]