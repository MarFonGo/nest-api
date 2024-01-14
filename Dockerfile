FROM node:alpine
WORKDIR /nest
ADD package.json /nest/package.json
RUN npm install --no-update-notifier
RUN npm build
ADD build /nest
EXPOSE 3000
CMD ["npm", "run", "start"]