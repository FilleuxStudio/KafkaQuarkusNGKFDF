FROM registry.access.redhat.com/ubi8/openjdk-21:1.21

WORKDIR /app

# Copier le pom.xml et télécharger les dépendances
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Copier les sources
COPY src src

# Copier le fichier de configuration Firebase
COPY src/main/resources/kafka-ccm-dev-cloud-df-kf-ng-48d9e2125a11.json /app/src/main/resources/

# Compiler l'application
RUN ./mvnw package -DskipTests

# Préparer l'application
ENV JAVA_APP_DIR=/app/target/quarkus-app
ENV JAVA_APP_JAR=quarkus-run.jar
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"

EXPOSE 8080

# Lancer l'application
ENTRYPOINT java $JAVA_OPTS_APPEND -jar $JAVA_APP_DIR/$JAVA_APP_JAR 