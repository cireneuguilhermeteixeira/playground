# 📦 Postgres POC with Users, Photos and JSON View

This project is a proof of concept using PostgreSQL with Docker. It demonstrates:

- Database schema with users, photos, and tagged users
- SQL-based migrations and seeds
- A JSON-enabled view to paginate users and their photos
- Docker-based setup for quick deployment

---

## 🚀 How to Run the Project

### 1. Build and Start with Docker

```bash
docker-compose up --build
```
The container will:

Create a PostgreSQL database mydb

Initialize the schema and seed the data automatically

Expose the database on localhost:5433

### 2. 🧪 Connection Info

| Field    | Value       |
| -------- | ----------- |
| Host     | `localhost` |
| Port     | `5433`      |
| User     | `user`      |
| Password | `password`  |
| Database | `mydb`      |


- Example connection
```bash
psql -h localhost -p 5555 -U user -d mydb
```

- Example Query:
```bash
SELECT * FROM user_photos_paginated LIMIT 10 OFFSET 0;
```