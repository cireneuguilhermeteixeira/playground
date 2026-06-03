import { useMemo, useState } from "react";
import { getReadableCookies } from "./storage";

type AuthResponse = {
  accessToken: string;
  accessTokenExpiresIn: number;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};

type RequestLog = {
  label: string;
  status: number;
  body: unknown;
  at: string;
};

function format(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function readCookie(name: string) {
  return getReadableCookies().find((cookie) => cookie.name === name)?.value ?? "";
}

async function readJson(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export function AuthDemo() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const visibleCookies = getReadableCookies();
  const decodedAccessToken = useMemo(() => {
    if (!accessToken) {
      return null;
    }

    try {
      const [, payload] = accessToken.split(".");
      const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
      return JSON.parse(atob(padded.replaceAll("-", "+").replaceAll("_", "/")));
    } catch {
      return { error: "Could not decode access token payload." };
    }
  }, [accessToken]);

  function addLog(label: string, status: number, body: unknown) {
    setLogs((current) => [
      {
        label,
        status,
        body,
        at: new Date().toISOString(),
      },
      ...current.slice(0, 8),
    ]);
  }

  function storeAuth(data: AuthResponse) {
    setAccessToken(data.accessToken);
    setExpiresAt(Date.now() + data.accessTokenExpiresIn * 1000);
  }

  async function login() {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const body = await readJson(response);

    if (response.ok) {
      storeAuth(body as AuthResponse);
    }

    addLog("POST /api/auth/login", response.status, body);
  }

  async function refreshAccessToken() {
    const csrfToken = readCookie("csrf_token");
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    });
    const body = await readJson(response);

    if (response.ok) {
      const authBody = body as AuthResponse;
      storeAuth(authBody);
      addLog("POST /api/auth/refresh", response.status, body);
      return authBody.accessToken;
    } else {
      setAccessToken(null);
      setExpiresAt(null);
    }

    addLog("POST /api/auth/refresh", response.status, body);
    return null;
  }

  async function getProfile() {
    const makeRequest = (token: string | null) =>
      fetch("/api/me", {
        credentials: "include",
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      });

    let token = accessToken;
    let response = await makeRequest(token);
    let body = await readJson(response);

    if (response.status === 401 && autoRefresh) {
      token = await refreshAccessToken();

      if (token) {
        response = await makeRequest(token);
        body = await readJson(response);
      }
    }

    addLog("GET /api/me", response.status, body);
  }

  async function logout() {
    const csrfToken = readCookie("csrf_token");
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    });
    const body = await readJson(response);

    setAccessToken(null);
    setExpiresAt(null);
    addLog("POST /api/auth/logout", response.status, body);
  }

  async function listServerSessions() {
    const response = await fetch("/api/debug/sessions", {
      credentials: "include",
    });
    const body = await readJson(response);

    addLog("GET /api/debug/sessions", response.status, body);
  }

  return (
    <>
      <header>
        <h1>Real auth cookie flow</h1>
        <p>
          Express issues a short-lived bearer access token and stores an opaque refresh token in an
          HttpOnly cookie. The refresh token is rotated every time it is used.
        </p>
        <nav className="nav">
          <a href="#/">Storage/auth overview</a>
          <a href="#/auth">Real auth flow</a>
          <a href="#/cookies">Cookie examples</a>
        </nav>
      </header>

      <section>
        <h2>Credentials</h2>
        <div className="form-row">
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
        </div>
        <div className="actions">
          <button onClick={login}>Login</button>
          <button onClick={getProfile}>Call protected endpoint</button>
          <button onClick={refreshAccessToken}>Refresh access token</button>
          <button onClick={listServerSessions}>List server sessions</button>
          <button className="danger" onClick={logout}>Logout</button>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(event) => setAutoRefresh(event.target.checked)}
            />
            Auto-refresh on 401
          </label>
        </div>
      </section>

      <section>
        <h2>Browser state</h2>
        <div className="grid">
          <article>
            <h3>Visible cookies</h3>
            <p>
              The readable CSRF cookie appears here. The HttpOnly refresh_token cookie should not.
            </p>
            <pre>{format(visibleCookies)}</pre>
          </article>
          <article>
            <h3>Access token in memory</h3>
            <p>It expires quickly and is intentionally not written to localStorage.</p>
            <pre>{accessToken ?? "null"}</pre>
            <p>
              Expires at:{" "}
              {expiresAt ? new Date(expiresAt).toLocaleTimeString() : "not authenticated"}
            </p>
          </article>
          <article>
            <h3>Decoded access token payload</h3>
            <pre>{format(decodedAccessToken)}</pre>
          </article>
          <article>
            <h3>Security properties</h3>
            <ul>
              <li>refresh_token: HttpOnly, SameSite=Lax, Path=/api/auth, Priority=High</li>
              <li>refresh_token is opaque; the server stores only its SHA-256 hash.</li>
              <li>refresh rotates the refresh token and CSRF token.</li>
              <li>unsafe auth requests validate Origin and X-CSRF-Token.</li>
              <li>access token is a short-lived Bearer JWT kept in React memory.</li>
            </ul>
          </article>
        </div>
      </section>

      <section>
        <h2>Request log</h2>
        <pre>{format(logs)}</pre>
      </section>
    </>
  );
}
