# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21 as build-stage

WORKDIR /app

COPY package*.json ./

# 의존성 설치
# npm install 명령어 실행 전에 npm config를 설정하여 타임아웃을 늘리고,
# 레지스트리를 명시적으로 설정합니다.
# 'prefer-online'과 'prefer-offline' 옵션은 제거했습니다.
RUN npm config set cache /root/.npm && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-timeout 600000 && \
    npm config set registry "https://registry.npmjs.org/" && \
    npm install

# 모든 프론트엔드 소스 코드 복사
COPY . .

# 프로덕션용 빌드 (예: React의 'npm run build'는 'build' 폴더에 결과물을 생성)
RUN npm run build

# 컨테이너가 3000번 포트를 사용한다는 것을 명시합니다.
EXPOSE 3000

# 컨테이너 시작 시 실행할 명령어입니다.
# 'npm start'가 프론트엔드 애플리케이션을 3000번 포트에서 구동한다고 가정합니다.
CMD ["npm", "start"]
