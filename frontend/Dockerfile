# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
# Node.js 21 버전의 경량(alpine) 이미지를 사용합니다.
FROM node:21-alpine as build-stage

# 컨테이너 내부의 작업 디렉토리를 /app으로 설정합니다.
# docker-compose.yml에서 build: ./frontend로 지정했으므로,
# 이 /app 디렉토리로 호스트의 'frontend' 폴더 내용이 복사됩니다.
WORKDIR /app

# package.json과 package-lock.json (또는 yarn.lock) 파일을 먼저 복사합니다.
# 이는 의존성 설치 레이어를 캐싱하여 빌드 속도를 최적화하기 위함입니다.
COPY package*.json ./

# 의존성 설치 시 네트워크 타임아웃을 늘리고, npm install을 실행합니다.
# fetch-retry-maxtimeout: 패키지 다운로드 재시도 시 최대 대기 시간 (ms)
# fetch-timeout: 단일 패키지 다운로드 시 최대 대기 시간 (ms)
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm install

# 모든 프론트엔드 소스 코드 복사 (의존성 설치 후)
# .dockerignore 파일에 명시된 파일/디렉토리는 제외됩니다.
COPY . .

# React 애플리케이션을 프로덕션용으로 빌드합니다.
# 이 명령어는 'build' 또는 'dist'와 같은 정적 파일들을 생성합니다.
# 프로젝트에 따라 'npm run build' 대신 'yarn build' 등을 사용하세요.
RUN npm npm run build

# Stage 2: 빌드된 애플리케이션을 Nginx를 통해 서빙 (production-stage)
# Nginx의 안정적인 경량(alpine) 이미지를 사용합니다.
FROM nginx:stable-alpine as production-stage

# Nginx 기본 설정 파일을 삭제하고 사용자 정의 설정 파일을 복사합니다.
# 이 파일은 프론트엔드 프로젝트 폴더(./frontend) 안에 'nginx.conf'라는 이름으로 있어야 합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 첫 번째 Stage (build-stage)에서 빌드된 정적 파일들을 Nginx의 웹 루트 디렉토리로 복사합니다.
# '/app/build'는 'npm run build' 명령으로 생성되는 실제 빌드 결과물 폴더 경로입니다.
# 만약 빌드 결과물이 'dist' 폴더에 생성된다면, '/app/dist'로 변경해야 합니다.
COPY --from=build-stage /app/build /usr/share/nginx/html

# Nginx가 80번 포트에서 요청을 수신하도록 노출합니다.
EXPOSE 80

# 컨테이너가 시작될 때 Nginx 프로세스를 포그라운드에서 실행하여 컨테이너가 계속 실행되도록 합니다.
CMD ["nginx", "-g", "daemon off;"]
