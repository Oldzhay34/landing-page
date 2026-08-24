# --- build stage ---
# Capacity Planner imajindan farkli olarak mvnw yerine dogrudan maven imaji
# kullaniliyor - bu serviste wrapper tutmaya gerek yok.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -q -B dependency:go-offline

COPY src src
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

# --- run stage ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/app.jar app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
