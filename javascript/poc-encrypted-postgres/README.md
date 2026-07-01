# Encrypted PostgreSQL User CRUD POC

Simple proof of concept for a user CRUD API built with Express and PostgreSQL. The goal is to show how personally identifiable information (PII) can be encrypted before being stored in the database and decrypted when returned by the API.

## Stack

- Node.js
- Express
- PostgreSQL
- `pg` for database access
- Node.js `crypto` module for application-layer encryption
- Docker Compose for the local database

## Project Structure

```text
src/
  app.js                    # Express app setup
  server.js                 # HTTP server bootstrap
  config/env.js             # Environment variables
  controllers/              # Request handlers
  db/                       # PostgreSQL connection and health checks
  middlewares/              # Express middlewares
  repositories/             # SQL queries and data mapping
  routes/                   # Route definitions
  security/encryption.js    # Encryption, decryption, and lookup hashing
sql/schema.sql              # Database schema
docker-compose.yml          # Local PostgreSQL service
```

## User Model

The API accepts and returns users with the following fields:

- `id`
- `name`
- `cpf`
- `address`
- `nickname`
- `createdAt`
- `updatedAt`

In PostgreSQL, PII fields are stored encrypted:

- `name` is stored as `name_encrypted`
- `cpf` is stored as `cpf_encrypted`
- `address` is stored as `address_encrypted`

The `id` and `nickname` fields remain in plain text. The database also stores `cpf_hash`, a deterministic SHA-256 hash used only to enforce CPF uniqueness without storing the CPF in plain text.

## Encryption

This POC uses AES-256-GCM in the application layer. Each encrypted value gets a random initialization vector, so the same plain text produces different encrypted values each time.

Generate a local 32-byte key encoded as base64:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Then set it in `.env`:

```bash
ENCRYPTION_KEY_BASE64=your-generated-key
```

Keep this key outside the repository. In a real production environment, store and rotate encryption keys with a secrets manager or KMS.

## Setup

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Generate an encryption key and replace `ENCRYPTION_KEY_BASE64` in `.env`.

Start PostgreSQL:

```bash
docker compose up -d
```

The database schema is automatically created when the PostgreSQL container starts for the first time. If you want to run the schema manually, use:

```bash
npm run db:init
```

If you already started the database before the schema changed, recreate the local database volume or apply the schema changes manually.

Start the API:

```bash
npm run dev
```

The server runs at:

```text
http://localhost:3000
```

## Endpoints

### Health Check

```http
GET /health
```

### List Users

```http
GET /users
```

### Get User By ID

```http
GET /users/:id
```

### Create User

```http
POST /users
Content-Type: application/json

{
  "name": "Maria Silva",
  "cpf": "12345678900",
  "address": "Av. Paulista, 1000",
  "nickname": "maria"
}
```

### Update User

```http
PUT /users/:id
Content-Type: application/json

{
  "name": "Maria Souza",
  "cpf": "12345678900",
  "address": "Rua Augusta, 500",
  "nickname": "marias"
}
```

### Delete User

```http
DELETE /users/:id
```

## Example cURL

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria Silva","cpf":"12345678900","address":"Av. Paulista, 1000","nickname":"maria"}'
```

```bash
curl http://localhost:3000/users
```
