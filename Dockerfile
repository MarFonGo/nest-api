FROM node:alpine
WORKDIR /nest
ADD package.json /nest/package.json
RUN npm install
ADD . /nest
EXPOSE 3000
CMD ["npm", "run", "start"]
