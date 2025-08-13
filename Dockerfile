# Base 이미지로 Java 21 사용
FROM eclipse-temurin:21-jdk-jammy

# 작업 디렉토리 설정
WORKDIR /app

RUN apt-get update && apt-get install -y pandoc

# Gradle 빌드 파일들 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Gradle 빌드 실행 권한 부여
RUN chmod +x ./gradlew

# 애플리케이션 빌드
RUN ./gradlew clean build -x test

# 실행 JAR 파일의 이름을 지정
RUN mv build/libs/AI-Challenge-0.0.1-SNAPSHOT.jar app.jar

# 실행할 JAR 파일 지정
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=docker", "app.jar"]

# 컨테이너 포트 설정
EXPOSE 8080
