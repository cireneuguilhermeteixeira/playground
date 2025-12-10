# FusionAuth + Node.js POC (Simplified Guide)

This is a short and direct guide showing how to run FusionAuth with Docker and authenticate users in a simple Node.js application.

---

## 1. Run FusionAuth with Docker

### `.env`

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_USERNAME=fusionauth
DATABASE_PASSWORD=changeit
FUSIONAUTH_APP_RUNTIME_MODE=development
```

### `docker-compose.yml`

```
version: "3.8"

services:
  db:
    image: postgres:16.0-bookworm
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5433:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  fusionauth:
    image: fusionauth/fusionauth-app:latest
    depends_on:
      - db
    environment:
      DATABASE_URL: jdbc:postgresql://db:5432/fusionauth
      DATABASE_ROOT_USERNAME: ${POSTGRES_USER}
      DATABASE_ROOT_PASSWORD: ${POSTGRES_PASSWORD}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      FUSIONAUTH_APP_URL: http://localhost:9011
      SEARCH_TYPE: database
    ports:
      - "9011:9011"

volumes:
  db_data:
```

### Stop/Start FusionAuth

```
docker compose down -v
docker compose up -d
```

Access FusionAuth:

```
http://localhost:9011
```

Create your **admin user** when prompted.

<img width="916" height="890" alt="image" src="https://github.com/user-attachments/assets/e9aa6f1b-cbcb-41a5-8739-44617d324fd5" />

---

## 2. Create an Application in FusionAuth

Go to:

```
Applications → Add
```
<img width="1429" height="908" alt="image" src="https://github.com/user-attachments/assets/e3a25aa1-91bc-4809-b32b-1e76334f2cbb" />

Fill:

* **Name:** Node App

Go to **OAuth** tab:

* **Redirect URL:** `http://localhost:3000/callback`
* **Logout URL:** `http://localhost:3000/`
* Enable **Authorization Code** grant

Copy:

* **Client Id**
* **Client Secret**

---

## 3. Create a User for Testing

```
Users → Add
```
<img width="1427" height="917" alt="image" src="https://github.com/user-attachments/assets/d5237bc2-78a9-4660-bbb9-77810b2e31f7" />

* Create user
* Set a password
* Go to **Registrations** → Register user in **Node App**

---

## 4. Node.js App

Inside a folder `node-app`, create:

### `.env`

```
PORT=3000
FUSIONAUTH_BASE_URL=http://localhost:9011
OIDC_CLIENT_ID=PUT_HERE_CLIENT_ID
OIDC_CLIENT_SECRET=PUT_HERE_CLIENT_SECRET
OIDC_REDIRECT_URI=http://localhost:3000/callback
SESSION_SECRET=mysecret123
```


## 5. Run Node App

```
node server.mjs
```

Visit:

```
http://localhost:3000
```

Click **Login**, authenticate via FusionAuth, and return to `/me`.

---
<img width="1155" height="592" alt="image" src="https://github.com/user-attachments/assets/bae3fea3-9a4d-4dec-b7af-9144e4300caf" />
<img width="1020" height="607" alt="image" src="https://github.com/user-attachments/assets/9a220eae-9764-4ae4-90a5-43d7a30628b7" />

## Done

You now have a minimal FusionAuth + Node.js OAuth2 login example.





