# Keycloak + Node.js POC (Docker Compose)

This project is a **Proof of Concept (POC)** that demonstrates how to:

* Run **Keycloak** using **Docker Compose**
* Create a **Realm**, **Client**, and **User**
* Authenticate a **Node.js (Express)** application using **OpenID Connect (Authorization Code + PKCE)**

---

## 1. What is a Realm?

A **Realm** in Keycloak is an **isolated authentication environment**.

Each realm has its own:

* Users
* Passwords
* Roles
* Clients (applications)
* Tokens

Nothing is shared between realms.

### Example

| Realm      | Purpose                 |
| ---------- | ----------------------- |
| master     | Keycloak administration |
| poc-realm  | Your Node.js POC        |
| mobile-app | Mobile authentication   |

For this project, we will use:

```
Realm name: poc-realm
```

---

## 2. Infrastructure (Docker Compose)

### docker-compose.yml

```yaml
version: "3.8"

services:
  keycloak:
    image: quay.io/keycloak/keycloak:26.0.0
    container_name: keycloak
    command: ["start-dev"]
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_HOSTNAME: localhost
    ports:
      - "8080:8080"
```

### Start everything

```bash
docker compose up -d
```

Access Keycloak Admin Panel:

```
http://localhost:8080
```

Login:

* User: `admin`
* Password: `admin`

---

## 3. Creating a Realm

1. Open **Administration Console**
2. Click the Realm selector (top left)
3. Click **Create realm**
4. Enter:

```
Realm name: poc-realm
```

5. Click **Create**

---

## 4. What is a Client? (Difference Between Client and User)

| Concept    | Meaning                                          |
| ---------- | ------------------------------------------------ |
| **Client** | An application (Node, Frontend, Mobile App, API) |
| **User**   | A person who logs in                             |

So in this project:

* **Client** = Your Node.js application
* **User** = Person who authenticates through Keycloak

---

## 5. Creating a Client (Node Application)

1. Inside `poc-realm`, go to **Clients**
2. Click **Create client**
3. Fill:

```
Client ID: node-app
Protocol: openid-connect
```

4. Click **Next**

### Enable Authentication Flow

Set:

* Client Authentication: ✅ ON
* Standard Flow: ✅ ON
* Direct Access Grants: ❌ OFF
* Implicit Flow: ❌ OFF

### URLs

```
Root URL: http://localhost:3000
Valid Redirect URIs: http://localhost:3000/callback
Web Origins: http://localhost:3000
```

Click **Save**

---

## 6. Getting the Client Secret

1. Open the client `node-app`
2. Go to **Credentials**
3. Copy the **Client Secret**

You will use this in the Node.js `.env` file as:

```
OIDC_CLIENT_SECRET=YOUR_SECRET_HERE
```

---

## 7. Creating a User

1. Inside `poc-realm`, go to **Users**
2. Click **Create user**
3. Fill:

```
Username: teste
Email: teste@email.com (optional)
First Name: Test
Last Name: User
```

4. Click **Create**

### Set User Password

1. Open the created user
2. Go to **Credentials**
3. Set password:

```
Password: 123456
Confirm: 123456
Temporary: OFF
```

4. Save

---

## 8. Node.js Application Environment Variables

Create a `.env` file in your Node project:

```env
PORT=3000

OIDC_ISSUER_URL=http://localhost:8080/realms/poc-realm
OIDC_CLIENT_ID=node-app
OIDC_CLIENT_SECRET=PASTE_CLIENT_SECRET_HERE
OIDC_REDIRECT_URI=http://localhost:3000/callback

SESSION_SECRET=ANY_LONG_RANDOM_STRING
```

Generate a secure session secret using:

```bash
openssl rand -hex 32
```

---

## 9. Running the Node Application

```bash
npm install
npm start
```

Application URL:

```
http://localhost:3000
```

---

## 10. Logging in Through the Application

1. Open:

```
http://localhost:3000
```

2. Click **Login with Keycloak**
3. You will be redirected to the Keycloak login page
4. Use:

```
Username: teste
Password: 123456
```

5. After successful login, you will be redirected back to the Node app with user information

---
