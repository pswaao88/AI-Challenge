# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21 as build-stage

WORKDIR /app

COPY package*.json ./

RUN npm config set cache /root/.npm && \
    npm config set fetch-retry-factor 50 && \        # 재시도 대기 시간을 더 공격적으로 늘림
    npm config set fetch-retry-mintimeout 20000 && \ # 최소 대기 시간을 20초로 늘림
    npm config set fetch-retry-maxtimeout 1200000 && \ # 최대 대기 시간을 20분(1.2M ms)으로 늘림
    npm config set fetch-timeout 300000 && \         # 단일 요청 타임아웃을 5분(300k ms)으로 늘림
    npm config set registry "https://registry.npmjs.org/" && \
    npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
