FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD [ "npm", "start" ]
