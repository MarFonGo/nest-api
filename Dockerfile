FROM node:alpine
WORKDIR /nest-api
ADD package.json /nest-api/package.json
RUN npm install
ADD . /nest-api
EXPOSE 3000
CMD ["npm", "run", "start"]