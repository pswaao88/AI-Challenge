# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm config set cache /root/.npm && \
    npm config set fetch-retry-factor 50 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 1200000 && \
    npm config set fetch-timeout 300000 && \
    npm config set registry "https://registry.npmjs.org/" && \
    npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
