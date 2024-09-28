FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install nodemon

COPY . .

RUN npm run migrate


#Build

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app .

CMD ["npm", "start"]

EXPOSE 5000
