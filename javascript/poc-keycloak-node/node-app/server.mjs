import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { Issuer, generators } from "openid-client";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false
  })
);

let client; // openid-client
let codeVerifierStore = {};

// Initialize OIDC client
async function initOidcClient() {
  const issuerUrl = process.env.OIDC_ISSUER_URL;
  console.log("Discovering issuer from:", issuerUrl);

  const keycloakIssuer = await Issuer.discover(issuerUrl);
  console.log("Discovered issuer %s", keycloakIssuer.issuer);

  client = new keycloakIssuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    redirect_uris: [process.env.OIDC_REDIRECT_URI],
    response_types: ["code"]
  });
}

// Middleware to protect routes
function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Home
app.get("/", (req, res) => {
  if (req.session.user) {
    res.send(`
      <h1>Hello, ${req.session.user.preferred_username || "user"}!</h1>
      <p>You are logged in via Keycloak.</p>
      <pre>${JSON.stringify(req.session.user, null, 2)}</pre>
      <a href="/protected">Go to protected page</a><br/>
      <a href="/logout">Logout</a>
    `);
  } else {
    res.send(`
      <h1>POC Keycloak + Node</h1>
      <a href="/login">Login with Keycloak</a>
    `);
  }
});

// Rota de login
app.get("/login", async (req, res, next) => {
  try {
    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    // Store PKCE code verifier in session
    req.session.codeVerifier = codeVerifier;

    const authorizationUrl = client.authorizationUrl({
      scope: "openid profile email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });

    res.redirect(authorizationUrl);
  } catch (err) {
    next(err);
  }
});

// Callback of Keycloak
app.get("/callback", async (req, res, next) => {
  const params = client.callbackParams(req);
  const codeVerifier = req.session.codeVerifier;

  try {
    const tokenSet = await client.callback(
      process.env.OIDC_REDIRECT_URI,
      params,
      { code_verifier: codeVerifier }
    );

    // Decode Id Token to get user info
    const userinfo = tokenSet.claims();
    req.session.user = userinfo;

    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

// Protected route
app.get("/protected", requireAuth, (req, res) => {
  res.send(`
    <h1>Protected Resource</h1>
    <p>Only logged-in users can see this.</p>
    <pre>${JSON.stringify(req.session.user, null, 2)}</pre>
    <a href="/">Home</a><br/>
    <a href="/logout">Logout</a>
  `);
});

// Logout route
app.get("/logout", (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Start server after initializing OIDC client
initOidcClient()
  .then(() => {
    app.listen(port, () => {
      console.log(`Node app listening on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error("Failed to initialize OIDC client", err);
    process.exit(1);
  });
