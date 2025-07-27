FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn dependency:go-offline -B --quiet

COPY src ./src
RUN mvn clean package -DskipTests -B --quiet


FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Create .env file with Docker environment variables
RUN echo "# Docker Environment Variables" > .env && \
    echo "SPRING_DATASOURCE_URL=\${SPRING_DATASOURCE_URL}" >> .env && \
    echo "SPRING_DATASOURCE_USERNAME=\${SPRING_DATASOURCE_USERNAME}" >> .env && \
    echo "SPRING_DATASOURCE_PASSWORD=\${SPRING_DATASOURCE_PASSWORD}" >> .env

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

