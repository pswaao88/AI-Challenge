# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21-alpine as build-stage

WORKDIR /app

COPY package*.json ./

# npm install 명령어 실행 전에 npm config를 설정하여 타임아웃을 늘리고,
# 레지스트리를 명시적으로 설정합니다.
# ipv6 관련 설정은 도커 데몬 수준에서 처리하므로 여기서는 제거합니다.
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry "https://registry.npmjs.org/" && \
    npm config set prefer-online true && \
    npm config set prefer-offline false && \
    npm install

COPY . .

RUN npm run build

# Stage 2: 빌드된 애플리케이션을 Nginx를 통해 서빙 (production-stage)
FROM nginx:stable-alpine as production-stage

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
