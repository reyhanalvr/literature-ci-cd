FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install nodemon

COPY . .

# Multistage build

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app .

CMD ["sh", "-c", "npm run migrate && npm start"]

EXPOSE 5000
