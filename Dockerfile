FROM node:5.9.0

RUN mkdir -p /app
WORKDIR /app

ADD package.json /app
RUN npm install

RUN mkdir -p /app/www
WORKDIR /app/www

RUN npm install -g bower
ADD www/bower.json /app/www
RUN bower install

WORKDIR /app

ADD . /app

CMD ["bin/serve"]

