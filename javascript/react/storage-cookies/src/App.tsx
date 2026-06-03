import { useEffect, useMemo, useState } from "react";
import { AuthDemo } from "./AuthDemo";
import { CookieExamples } from "./CookieExamples";
import {
  buildRecord,
  clearPocStorage,
  createUnsignedJwt,
  decodeJwt,
  deleteCookie,
  getReadableCookies,
  keys,
  readStorage,
  removeStorage,
  setCookie,
  writeStorage,
  type DemoRecord,
} from "./storage";

type CookieRow = {
  name: string;
  value: string;
};

const authMethods = [
  {
    type: "Session cookie",
    where: "HttpOnly + Secure + SameSite cookie managed by the server.",
    use: "Traditional web apps, BFF, SSR, and apps that need to reduce XSS token exposure.",
    avoid: "APIs consumed by many non-browser clients without a clear gateway.",
  },
  {
    type: "Bearer access token",
    where: "Header Authorization: Bearer <token>.",
    use: "SPAs calling APIs, mobile apps, CLIs, and server-to-server integrations.",
    avoid: "Storing long-lived tokens in localStorage. Prefer short-lived access tokens in memory.",
  },
  {
    type: "JWT",
    where: "A signed token format with claims; it is not a storage location.",
    use: "When an API needs to validate claims without loading a server session on every request.",
    avoid: "Sensitive claims, long-lived tokens without revocation, or trusting JWTs without signature validation.",
  },
  {
    type: "Refresh token",
    where: "HttpOnly cookie or secure device storage.",
    use: "Renewing short-lived access tokens without asking the user to log in repeatedly.",
    avoid: "Sending it to every API. Restrict it to the refresh endpoint.",
  },
  {
    type: "API key",
    where: "Custom header, secret manager, or backend environment variable.",
    use: "Server-to-server integration and application identification.",
    avoid: "Public frontends. An API key in the browser is not a secret.",
  },
  {
    type: "Basic auth",
    where: "Authorization header with Base64 user:password over HTTPS.",
    use: "Simple internal tools, tests, and legacy endpoints.",
    avoid: "Modern end-user apps without additional controls.",
  },
  {
    type: "OAuth 2.0 / OIDC",
    where: "Authorization Code + PKCE in the browser; tokens are issued by an Identity Provider.",
    use: "Social login, corporate SSO, delegated authorization, and SPA/mobile apps.",
    avoid: "The legacy implicit flow. Use Authorization Code with PKCE.",
  },
  {
    type: "mTLS",
    where: "Client certificate on the TLS connection.",
    use: "High-trust server-to-server communication.",
    avoid: "SPAs and regular end-user flows.",
  },
];

const storageMatrix = [
  {
    name: "localStorage",
    duration: "Persists until manual removal.",
    scope: "Same origin, shared across tabs.",
    good: "Non-sensitive preferences, lightweight cache, local flags.",
    risk: "Readable by JavaScript; XSS can read it.",
  },
  {
    name: "sessionStorage",
    duration: "Lasts while the tab/window exists.",
    scope: "Same origin, isolated per tab.",
    good: "Temporary flow state, wizards, tab-specific filters.",
    risk: "Also readable by JavaScript; it does not solve XSS.",
  },
  {
    name: "cookie",
    duration: "Browser session or Max-Age/Expires.",
    scope: "Automatically sent on requests that match Domain/Path/SameSite.",
    good: "Web sessions, HttpOnly refresh tokens, small preferences.",
    risk: "CSRF if SameSite/CSRF tokens are misconfigured; small size limit.",
  },
];

function format(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function readAll() {
  return {
    local: readStorage("localStorage", keys.local),
    session: readStorage("sessionStorage", keys.session),
    jwt: window.localStorage.getItem(keys.jwt),
    cookies: getReadableCookies(),
  };
}

function App() {
  const [route, setRoute] = useState(() => window.location.hash || "#/");
  const [snapshot, setSnapshot] = useState<{
    local: DemoRecord | null;
    session: DemoRecord | null;
    jwt: string | null;
    cookies: CookieRow[];
  }>(() => readAll());
  const [decodedJwt, setDecodedJwt] = useState<unknown>(null);

  const cookieNames = useMemo(() => ["poc_theme", "poc_session_hint", "poc_refresh_demo"], []);

  function refresh() {
    setSnapshot(readAll());
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    function handleHashChange() {
      setRoute(window.location.hash || "#/");
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function createLocalStorageDemo() {
    writeStorage(
      "localStorage",
      keys.local,
      buildRecord("localStorage", {
        theme: "dark",
        language: "en-US",
        note: "persists after closing and reopening the browser",
      }),
    );
    refresh();
  }

  function createSessionStorageDemo() {
    writeStorage(
      "sessionStorage",
      keys.session,
      buildRecord("sessionStorage", {
        checkoutStep: 2,
        tabScopedDraft: "draft scoped to this tab only",
        note: "disappears when this tab is closed",
      }),
    );
    refresh();
  }

  function createCookieDemo() {
    setCookie("poc_theme", "compact", 60 * 60);
    setCookie("poc_session_hint", "browser-session");
    setCookie("poc_refresh_demo", "simulated-in-js", 60 * 5);
    refresh();
  }

  function createJwtDemo() {
    const now = Math.floor(Date.now() / 1000);
    const token = createUnsignedJwt({
      sub: "user-123",
      role: "admin",
      iat: now,
      exp: now + 15 * 60,
      note: "JWT demonstrates structure, not security. A real signature must be validated by the backend/API.",
    });
    window.localStorage.setItem(keys.jwt, token);
    setDecodedJwt(decodeJwt(token));
    refresh();
  }

  function decodeStoredJwt() {
    if (!snapshot.jwt) {
      setDecodedJwt({ error: "No JWT stored." });
      return;
    }

    try {
      setDecodedJwt(decodeJwt(snapshot.jwt));
    } catch (error) {
      setDecodedJwt({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  function clearCookies() {
    cookieNames.forEach((name) => deleteCookie(name));
    refresh();
  }

  function clearAll() {
    clearPocStorage();
    clearCookies();
    setDecodedJwt(null);
    refresh();
  }

  if (route === "#/cookies") {
    return (
      <main>
        <CookieExamples />
      </main>
    );
  }

  if (route === "#/auth") {
    return (
      <main>
        <AuthDemo />
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>POC: localStorage, sessionStorage, cookies, and authentication</h1>
        <p>
          Test each mechanism in the browser, reload the page, open another tab, and compare what
          persists, what disappears, and what is sent automatically.
        </p>
        <nav className="nav">
          <a href="#/">Storage/auth overview</a>
          <a href="#/auth">Real auth flow</a>
          <a href="#/cookies">Cookie examples</a>
        </nav>
      </header>

      <section>
        <h2>1. Quick comparison</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Duration</th>
                <th>Scope</th>
                <th>Use for</th>
                <th>Main risk</th>
              </tr>
            </thead>
            <tbody>
              {storageMatrix.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.duration}</td>
                  <td>{item.scope}</td>
                  <td>{item.good}</td>
                  <td>{item.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>2. Runnable experiments</h2>
        <div className="actions">
          <button onClick={createLocalStorageDemo}>Write localStorage</button>
          <button onClick={createSessionStorageDemo}>Write sessionStorage</button>
          <button onClick={createCookieDemo}>Create cookies</button>
          <button onClick={createJwtDemo}>Generate demo JWT</button>
          <button onClick={decodeStoredJwt}>Decode JWT</button>
          <button onClick={refresh}>Refresh readout</button>
          <button className="danger" onClick={clearAll}>Clear POC</button>
        </div>
        <div className="grid">
          <article>
            <h3>localStorage</h3>
            <p>Reload the page or open another tab: the value remains available.</p>
            <pre>{format(snapshot.local)}</pre>
            <button onClick={() => {
              removeStorage("localStorage", keys.local);
              refresh();
            }}>Remove localStorage</button>
          </article>
          <article>
            <h3>sessionStorage</h3>
            <p>Reload the same tab: it remains. Open another tab: it does not appear.</p>
            <pre>{format(snapshot.session)}</pre>
            <button onClick={() => {
              removeStorage("sessionStorage", keys.session);
              refresh();
            }}>Remove sessionStorage</button>
          </article>
          <article>
            <h3>cookies visible to JS</h3>
            <p>
              These cookies are demonstrative. Real HttpOnly cookies do not appear here and must be
              created by the server.
            </p>
            <pre>{format(snapshot.cookies)}</pre>
            <button onClick={clearCookies}>Remove POC cookies</button>
          </article>
          <article>
            <h3>JWT demo</h3>
            <p>JWT is a format. Storing it in the browser is a separate decision.</p>
            <pre>{snapshot.jwt ?? "null"}</pre>
            <pre>{format(decodedJwt)}</pre>
            <button onClick={() => {
              window.localStorage.removeItem(keys.jwt);
              setDecodedJwt(null);
              refresh();
            }}>Remove JWT</button>
          </article>
        </div>
      </section>

      <section>
        <h2>3. Where to store tokens</h2>
        <ul className="rules">
          <li><strong>Short-lived access token:</strong> preferably in memory. If the page reloads, renew it with a refresh token.</li>
          <li><strong>Web refresh token:</strong> HttpOnly, Secure, SameSite=Lax/Strict cookie; send it only to the refresh endpoint.</li>
          <li><strong>JWT:</strong> treat it as a credential if it grants access. Do not put sensitive data in the payload.</li>
          <li><strong>localStorage:</strong> acceptable for preferences and non-sensitive cache; poor fit for long-lived tokens.</li>
          <li><strong>sessionStorage:</strong> reduces persistence, but remains exposed to XSS.</li>
          <li><strong>Session cookie:</strong> good for web apps when the backend controls the session and applies CSRF/SameSite protections.</li>
        </ul>
      </section>

      <section>
        <h2>4. Authentication types and when to use them</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Where it lives / how it travels</th>
                <th>When to use</th>
                <th>Avoid when</th>
              </tr>
            </thead>
            <tbody>
              {authMethods.map((method) => (
                <tr key={method.type}>
                  <td>{method.type}</td>
                  <td>{method.where}</td>
                  <td>{method.use}</td>
                  <td>{method.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>5. Recommended flows</h2>
        <div className="flow">
          <h3>SPA + own API</h3>
          <ol>
            <li>Log in via Authorization Code + PKCE or your own endpoint.</li>
            <li>The backend sets the refresh token in an HttpOnly Secure SameSite cookie.</li>
            <li>The frontend keeps a short-lived access token in memory.</li>
            <li>The API receives Authorization Bearer and validates signature, exp, aud, iss, and scopes.</li>
            <li>When it expires, the frontend calls /refresh; the cookie is sent automatically; a new access token returns.</li>
          </ol>
        </div>
        <div className="flow">
          <h3>SSR/BFF</h3>
          <ol>
            <li>The user authenticates on the server.</li>
            <li>The server creates a session and sends an HttpOnly cookie.</li>
            <li>The browser sends the cookie automatically on every same-site request.</li>
            <li>The server loads the session, applies CSRF protection when needed, and calls internal APIs.</li>
          </ol>
        </div>
        <div className="flow">
          <h3>Server-to-server</h3>
          <ol>
            <li>Use OAuth client credentials, mTLS, or an API key stored in a secret manager.</li>
            <li>Never expose that secret in the React bundle.</li>
            <li>Rotate credentials and keep audit logs per client.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}

export default App;
