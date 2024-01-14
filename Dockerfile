FROM node:alpine
WORKDIR /nest-api
ADD package.json /nest-api/package.json
RUN npm install --no-update-notifier
ADD . /nest-api
EXPOSE 3000
CMD ["npm", "run", "start"]