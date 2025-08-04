# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21-alpine as build-stage

WORKDIR /app

COPY package*.json ./

# npm install 명령어 실행 전에 npm config를 설정하여 타임아웃을 늘리고,
# 레지스트리를 명시적으로 설정하며, IPv6 사용을 비활성화합니다.
# prefer-online: 네트워크 연결을 선호하여 캐시보다는 최신 정보를 가져오도록 합니다.
# prefer-offline: false로 설정하여 네트워크 연결이 필요할 때 오프라인 캐시만 사용하지 않도록 합니다.
# ipv6: false로 설정하여 npm이 IPv6 주소로 연결 시도하는 것을 막습니다.
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry "https://registry.npmjs.org/" && \
    npm config set prefer-online true && \
    npm config set prefer-offline false && \
    npm config set ipv6 false && \
    npm install

COPY . .

RUN npm run build

# Stage 2: 빌드된 애플리케이션을 Nginx를 통해 서빙 (production-stage)
FROM nginx:stable-alpine as production-stage

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build-stage /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
