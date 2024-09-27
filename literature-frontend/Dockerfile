FROM node:16-alpine as builder

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

#Multistage

FROM node:16-alpine 

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "start"]

