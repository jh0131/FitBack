FROM eclipse-temurin:25-jdk-jammy@sha256:e4f029273ed9e4444697df30bb6098dbe51477291598aebc54dd0b48d95d6ae7 AS builder

WORKDIR /workspace

COPY gradle gradle
COPY gradlew build.gradle settings.gradle ./

RUN chmod +x gradlew \
    && ./gradlew dependencies --configuration runtimeClasspath --no-daemon

COPY src/main src/main

RUN ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:25-jre-jammy@sha256:659b528cca74a0edc5c25315ec5819f35bce40bbcec645c4c534987e4c6be7c1

ARG VCS_REF=unknown

LABEL org.opencontainers.image.source="https://github.com/FIT-BACK/backend" \
      org.opencontainers.image.revision="${VCS_REF}"

RUN command -v curl > /dev/null \
    && groupadd --gid 10001 fitback \
    && useradd --uid 10001 --gid fitback --no-create-home --shell /usr/sbin/nologin fitback

WORKDIR /app

COPY --from=builder --chown=fitback:fitback /workspace/build/libs/*.jar app.jar

USER fitback

EXPOSE 8080

ENV SPRING_PROFILES_ACTIVE=prod

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl --fail --silent --show-error http://127.0.0.1:8080/actuator/health/readiness || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
