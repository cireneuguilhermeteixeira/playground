
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

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/dd811339-9d62-4020-a013-54d205759a93" />

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/154e7f15-9cb2-4b27-a185-7e48dd04659b" />


<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/ed6a972d-2ee8-4972-9fed-b3bc8cf980a0" />



# Run stress test in containers and integrating with Grafana by PushGateway

```bash
docker compose up -d
```

- After up and running all services, setup the prometheus in grafana and create the dashboard by importing this JSON config:


```bash
{
  "title": "Gatling - Pushgateway (Resumo)",
  "tags": ["gatling","pushgateway"],
  "timezone": "",
  "schemaVersion": 39,
  "version": 1,
  "refresh": "10s",
  "panels": [
    {
      "type": "stat",
      "title": "OK (total)",
      "targets": [
        { "expr": "sum by (simulation) (gatling_requests_ok_total)" }
      ],
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] }, "orientation": "auto" },
      "gridPos": { "h": 5, "w": 6, "x": 0, "y": 0 }
    },
    {
      "type": "stat",
      "title": "KO (total)",
      "targets": [
        { "expr": "sum by (simulation) (gatling_requests_ko_total)" }
      ],
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] }, "orientation": "auto" },
      "gridPos": { "h": 5, "w": 6, "x": 6, "y": 0 }
    },
    {
      "type": "stat",
      "title": "Erro (%)",
      "targets": [
        { "expr": "100 * sum by (simulation)(gatling_requests_ko_total) / clamp_min(sum by (simulation)(gatling_total_requests),1)" }
      ],
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "gridPos": { "h": 5, "w": 6, "x": 12, "y": 0 }
    },
    {
      "type": "stat",
      "title": "Duração (s)",
      "targets": [
        { "expr": "avg by (simulation) (gatling_run_duration_seconds)" }
      ],
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "gridPos": { "h": 5, "w": 6, "x": 18, "y": 0 }
    },
    {
      "type": "timeseries",
      "title": "RPS médio por execução",
      "targets": [
        { "expr": "avg by (simulation) (gatling_requests_per_second)" }
      ],
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 5 }
    },
    {
      "type": "timeseries",
      "title": "Tempo de resposta (médio e máximo)",
      "targets": [
        { "expr": "avg by (simulation) (gatling_mean_response_time_ms)" },
        { "expr": "max by (simulation) (gatling_max_response_time_ms)" }
      ],
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 5 }
    },
    {
      "type": "stat",
      "title": "Run Success (1 = ok, 0 = falhou)",
      "targets": [
        { "expr": "avg by (simulation) (gatling_run_success)" }
      ],
      "options": { "reduceOptions": { "calcs": ["lastNotNull"] } },
      "gridPos": { "h": 5, "w": 6, "x": 0, "y": 13 }
    },
    {
      "type": "table",
      "title": "Resumo por simulação/env/commit",
      "targets": [
        { "expr": "sum by (simulation, env, commit, instance) (gatling_total_requests)" },
        { "expr": "sum by (simulation, env, commit, instance) (gatling_requests_ok_total)" },
        { "expr": "sum by (simulation, env, commit, instance) (gatling_requests_ko_total)" },
        { "expr": "avg by (simulation, env, commit, instance) (gatling_mean_response_time_ms)" },
        { "expr": "max by (simulation, env, commit, instance) (gatling_max_response_time_ms)" },
        { "expr": "avg by (simulation, env, commit, instance) (gatling_requests_per_second)" }
      ],
      "gridPos": { "h": 9, "w": 18, "x": 6, "y": 13 },
      "options": { "showHeader": true }
    }
  ],
  "time": { "from": "now-6h", "to": "now" }
}
```

- TODO: Provide all this configuration via code instead of manually setup.


 # After it, run this to start the stress test and send the informations to Prometheus.

```bash
mvn -q -DskipTests gatling:test   -DPUSHGATEWAY_URL=localhost:9091   -DPUSH_JOB=gatling_tests   -DSIMULATION_TAG=DungeonSimulation   -DBASE_URL=http://localhost:8080
```
# Results in Grafana
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/bcd7730d-3d72-4180-b18e-8aedea44e9bb" />


