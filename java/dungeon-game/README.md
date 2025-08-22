
# Dungeon Game – Java 23 Backend

This project implements a **Dungeon Game** solver in Java 23 with a REST API built on **Spring Boot**.  
It supports saving game boards into **PostgreSQL**, tracks execution time, and exposes endpoints to retrieve results.  
Additionally, it includes **Docker** support and **Gatling stress tests** to evaluate API performance under load.

---

## 📂 Features
- **Java 23 + Spring Boot** backend.
- **REST API** to create and query games:
  - Create new games with execution time and result.
  - Retrieve all games or query by ID.
- **PostgreSQL database** integration with **Flyway** for migrations.
- **Docker** and **Docker Compose** support for local development.
- **Gatling stress tests** for:
  - Game creation endpoint.
  - Game query endpoints.

---

## 🛠️ Technologies Used
- **Java 23**
- **Spring Boot 3**
- **PostgreSQL 14**
- **Hibernate & JPA**
- **Flyway** for database migrations
- **Docker & Docker Compose**
- **Gatling** for stress/load testing

---

## 📦 Project Structure
```
/src
  /main
    /java/com/dungeon
      /controller    # REST controllers
      /service       # Business logic
      /repository    # JPA repositories
      /model         # Entities & DTOs
  /test
    /java/com/dungeon
      /gatling        # Gatling stress tests
Dockerfile
docker-compose.yml
pom.xml
README.md
```

---

## ⚙️ Setup and Run


### 1. Start PostgreSQL with Docker
```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** at `localhost:5432`
- A database named `dungeon`
- User/password from `application.yml`

---

### 2. Run the Spring Boot application
```bash
./mvnw spring-boot:run
```

The app will be available at:
```
http://localhost:8080
```

---

## 🗄️ API Endpoints

| Method | Endpoint            | Description                   |
|--------|---------------------|-------------------------------|
| `POST` | `/games`            | Create a new game board        |
| `GET`  | `/games`            | Get all saved games            |
| `GET`  | `/games/{id}`       | Get a game by ID               |

**Sample request (POST /games):**
```json
{
  "board": [[-1,-1],[-1,-1]],
  "solution": 3,
  "executionTimeMs": 12
}
```

---

## 🐳 Docker Support

### Build and Run the Application with Docker
```bash
docker build -t dungeon-game:latest .
docker run -p 8080:8080 --env-file .env dungeon-game:latest
```

### Using Docker Compose
```bash
docker-compose up --build
```

This will start both:
- The **Spring Boot app**
- The **PostgreSQL database**

---

## 🚀 Gatling Stress Tests

We use **Gatling** to simulate multiple users hitting the API concurrently.

### Run Gatling Tests
```bash
mvn gatling:test
```

### Test Scenarios
- **CreateGameSimulation**:  
  Stress test for the game creation endpoint (`POST /games`).
- **GetGamesSimulation**:  
  Stress test for game query endpoints (`GET /games`, `GET /games/{id}`).

After execution, Gatling generates an **HTML report** in:
```
target/gatling
```

Open the `index.html` file to view detailed metrics (latency, throughput, errors).

---

## ⚡ JVM Performance Tuning
You can tune JVM memory and Garbage Collector options using Docker `JAVA_OPTS`:

```bash
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseZGC"
```

- `-Xms / -Xmx` → Set initial and max heap size.
- `-XX:+UseZGC` → Use low-latency Z Garbage Collector.

---

```bash
sudo -u postgres psql
CREATE DATABASE dungeon;
CREATE USER dungeon_user WITH PASSWORD 'pass123';
GRANT ALL PRIVILEGES ON DATABASE gender_reveal TO dungeon_user;
ALTER ROLE dungeon_user CREATEDB;
\q
```
# To run stress test
```bash
 mvn gatling:test
```
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/0a81b34e-93af-479d-ba61-5b26aa03c048" />


<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/f35f73c2-74eb-4375-88fb-8bda0f141b89" />

