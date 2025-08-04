# Node.js 기반 이미지 사용
FROM node:21-alpine
# Alpine Linux 기반의 경량화된 Node.js 21 버전 이미지를 사용합니다.
# Alpine 이미지는 매우 작은 크기로 최적화되어 있습니다.

# 작업 디렉토리 설정
WORKDIR /app/frontend
# 컨테이너 내부에서 작업할 디렉토리를 지정합니다.
# 이후의 모든 명령어는 이 디렉토리를 기준으로 실행됩니다.

# package.json과 package-lock.json 복사
COPY package*.json ./
# 의존성 설치를 위한 패키지 파일들만 먼저 복사합니다.
# 이는 Docker 레이어 캐싱을 최적화하기 위한 것입니다.

# 의존성 설치
RUN npm install
# package.json에 명시된 모든 의존성을 설치합니다.

# frontend 디렉토리의 소스 코드 복사
COPY . .
# 현재 디렉토리의 모든 파일을 컨테이너의 작업 디렉토리로 복사합니다.
# .dockerignore 파일에 명시된 파일/디렉토리는 제외됩니다.

# 빌드
RUN npm run build
# React 애플리케이션을 프로덕션용으로 빌드합니다.
# 이 단계는 실제로는 개발 서버를 실행할 것이므로 필요하지 않을 수 있습니다.

# React 개발 서버 포트
EXPOSE 3000
# 컨테이너가 3000번 포트를 사용한다는 것을 문서화합니다.
# 실제 포트 매핑은 docker run의 -p 옵션이나 docker-compose.yml에서 해야 합니다.

# 앱 실행
CMD ["npm", "start"]
# 컨테이너가 시작될 때 실행할 명령어입니다.
# npm start는 개발 서버를 실행합니다.
