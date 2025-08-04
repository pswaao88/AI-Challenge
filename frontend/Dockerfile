# Stage 1: 프론트엔드 애플리케이션 빌드 (build-stage)
FROM node:21 as build-stage

WORKDIR /app

COPY package*.json ./

# 의존성 설치
# npm install 명령어 실행 전에 npm config를 설정하여 타임아웃 및 재시도 전략을 강화합니다.
# cache: npm 캐시 경로를 지정하여 볼륨 마운트 시 활용
# fetch-retry-factor: 재시도 간 대기 시간 증가 비율 (기본 10)
# fetch-retry-mintimeout: 재시도 간 최소 대기 시간 (ms, 기본 10000ms = 10초)
# fetch-retry-maxtimeout: 재시도 간 최대 대기 시간 (ms, 기본 60000ms = 1분)
# fetch-timeout: 단일 요청 타임아웃 (ms, 기본 60000ms = 1분)
# registry: 사용할 npm 레지스트리 URL을 명시
RUN npm config set cache /root/.npm && \
    npm config set fetch-retry-factor 50 && \        # 재시도 대기 시간을 더 공격적으로 늘림
    npm config set fetch-retry-mintimeout 20000 && \ # 최소 대기 시간을 20초로 늘림
    npm config set fetch-retry-maxtimeout 1200000 && \ # 최대 대기 시간을 20분(1.2M ms)으로 늘림
    npm config set fetch-timeout 300000 && \         # 단일 요청 타임아웃을 5분(300k ms)으로 늘림
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
