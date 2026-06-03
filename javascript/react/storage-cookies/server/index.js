import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173";
const isProduction = process.env.NODE_ENV === "production";
const accessTokenSecret =
  process.env.ACCESS_TOKEN_SECRET ?? "dev-only-change-me-access-token-secret";
const accessTokenTtlSeconds = 30;
const refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;
const refreshCookieName = "refresh_token";
const csrfCookieName = "csrf_token";
const authCookiePath = "/api/auth";

const users = [
  {
    id: "user-123",
    email: "demo@example.com",
    passwordHash: bcrypt.hashSync("password123", 12),
    roles: ["user"],
  },
];

const sessions = new Map();

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    },
    accessTokenSecret,
    {
      algorithm: "HS256",
      expiresIn: accessTokenTtlSeconds,
      issuer: "storage-cookies-poc",
      audience: "storage-cookies-api",
      jwtid: crypto.randomUUID(),
    },
  );
}

function createSession(userId) {
  const sessionId = crypto.randomUUID();
  const refreshSecret = randomToken();
  const csrfToken = randomToken(24);
  const expiresAt = Date.now() + refreshTokenTtlMs;

  sessions.set(sessionId, {
    userId,
    refreshTokenHash: hashToken(refreshSecret),
    csrfToken,
    expiresAt,
    revokedAt: null,
    createdAt: Date.now(),
    rotatedAt: Date.now(),
  });

  return {
    sessionId,
    refreshSecret,
    csrfToken,
    refreshToken: `${sessionId}.${refreshSecret}`,
  };
}

function rotateSession(sessionId, session) {
  const refreshSecret = randomToken();
  const csrfToken = randomToken(24);

  session.refreshTokenHash = hashToken(refreshSecret);
  session.csrfToken = csrfToken;
  session.rotatedAt = Date.now();

  return {
    csrfToken,
    refreshToken: `${sessionId}.${refreshSecret}`,
  };
}

function getCookieOptions(httpOnly) {
  return {
    httpOnly,
    secure: isProduction,
    sameSite: "lax",
    path: authCookiePath,
    maxAge: refreshTokenTtlMs,
    priority: "high",
  };
}

function setAuthCookies(res, refreshToken, csrfToken) {
  res.cookie(refreshCookieName, refreshToken, getCookieOptions(true));
  res.cookie(csrfCookieName, csrfToken, getCookieOptions(false));
}

function clearAuthCookies(res) {
  res.clearCookie(refreshCookieName, getCookieOptions(true));
  res.clearCookie(csrfCookieName, getCookieOptions(false));
}

function requireTrustedOrigin(req, res, next) {
  const origin = req.get("origin");

  if (!origin || origin === clientOrigin) {
    next();
    return;
  }

  res.status(403).json({ error: "Untrusted request origin." });
}

function readRefreshToken(req) {
  const raw = req.cookies[refreshCookieName];

  if (!raw || typeof raw !== "string") {
    return null;
  }

  const [sessionId, refreshSecret] = raw.split(".");

  if (!sessionId || !refreshSecret) {
    return null;
  }

  return { sessionId, refreshSecret };
}

function requireCsrf(req, res, next) {
  const csrfHeader = req.get("x-csrf-token");
  const csrfCookie = req.cookies[csrfCookieName];
  const refreshToken = readRefreshToken(req);

  if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie || !refreshToken) {
    res.status(403).json({ error: "CSRF validation failed." });
    return;
  }

  const session = sessions.get(refreshToken.sessionId);

  if (!session || session.csrfToken !== csrfHeader) {
    res.status(403).json({ error: "CSRF validation failed." });
    return;
  }

  req.refreshToken = refreshToken;
  req.session = session;
  next();
}

function requireAccessToken(req, res, next) {
  const authorization = req.get("authorization") ?? "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Missing bearer access token." });
    return;
  }

  try {
    req.accessTokenPayload = jwt.verify(token, accessTokenSecret, {
      algorithms: ["HS256"],
      issuer: "storage-cookies-poc",
      audience: "storage-cookies-api",
    });
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired access token." });
  }
}

function getUserById(userId) {
  return users.find((user) => user.id === userId);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/auth/login", authLimiter, requireTrustedOrigin, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((candidate) => candidate.email === email);

  if (!user || !(await bcrypt.compare(password ?? "", user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const accessToken = createAccessToken(user);
  const session = createSession(user.id);

  setAuthCookies(res, session.refreshToken, session.csrfToken);

  res.json({
    accessToken,
    accessTokenExpiresIn: accessTokenTtlSeconds,
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
  });
});

app.post(
  "/auth/refresh",
  authLimiter,
  requireTrustedOrigin,
  requireCsrf,
  (req, res) => {
    const { sessionId, refreshSecret } = req.refreshToken;
    const session = req.session;

    if (session.revokedAt || session.expiresAt <= Date.now()) {
      sessions.delete(sessionId);
      clearAuthCookies(res);
      res.status(401).json({ error: "Refresh session expired or revoked." });
      return;
    }

    const incomingHash = hashToken(refreshSecret);

    if (incomingHash !== session.refreshTokenHash) {
      session.revokedAt = Date.now();
      clearAuthCookies(res);
      res.status(401).json({ error: "Refresh token reuse detected. Session revoked." });
      return;
    }

    const user = getUserById(session.userId);

    if (!user) {
      sessions.delete(sessionId);
      clearAuthCookies(res);
      res.status(401).json({ error: "User no longer exists." });
      return;
    }

    const rotated = rotateSession(sessionId, session);
    const accessToken = createAccessToken(user);

    setAuthCookies(res, rotated.refreshToken, rotated.csrfToken);

    res.json({
      accessToken,
      accessTokenExpiresIn: accessTokenTtlSeconds,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    });
  },
);

app.post("/auth/logout", requireTrustedOrigin, requireCsrf, (req, res) => {
  const { sessionId } = req.refreshToken;
  const session = sessions.get(sessionId);

  if (session) {
    session.revokedAt = Date.now();
  }

  clearAuthCookies(res);
  res.status(204).send();
});

app.get("/me", requireAccessToken, (req, res) => {
  const user = getUserById(req.accessTokenPayload.sub);

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
    accessTokenClaims: req.accessTokenPayload,
    serverTime: new Date().toISOString(),
  });
});

app.get("/debug/sessions", (_req, res) => {
  res.json({
    sessions: [...sessions.entries()].map(([sessionId, session]) => ({
      sessionId,
      userId: session.userId,
      expiresAt: new Date(session.expiresAt).toISOString(),
      revokedAt: session.revokedAt ? new Date(session.revokedAt).toISOString() : null,
      createdAt: new Date(session.createdAt).toISOString(),
      rotatedAt: new Date(session.rotatedAt).toISOString(),
      refreshTokenStoredAsHash: true,
      csrfTokenStoredServerSide: true,
    })),
  });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Auth API listening on http://127.0.0.1:${port}`);
  console.log("Demo credentials: demo@example.com / password123");
});
