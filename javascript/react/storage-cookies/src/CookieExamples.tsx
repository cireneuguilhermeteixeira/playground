import { useMemo, useState } from "react";
import { deleteCookie, getReadableCookies, setCookie } from "./storage";

type CookieExample = {
  title: string;
  description: string;
  setHeader: string;
  documentCookie?: string;
  action?: () => void;
  notes: string[];
};

function format(value: unknown) {
  return JSON.stringify(value, null, 2);
}

function nowPlus(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

export function CookieExamples() {
  const [cookies, setCookies] = useState(() => getReadableCookies());

  const examples = useMemo<CookieExample[]>(
    () => [
      {
        title: "Basic JavaScript-readable cookie",
        description: "Creates a simple cookie available through document.cookie.",
        setHeader: "Set-Cookie: poc_basic=hello; Path=/; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_basic=hello; Path=/; SameSite=Lax'",
        action: () => setCookie("poc_basic", "hello", { sameSite: "Lax" }),
        notes: [
          "Use only for non-sensitive values.",
          "JavaScript can read this cookie, so XSS can read it too.",
        ],
      },
      {
        title: "Session cookie",
        description: "No Max-Age or Expires. The browser keeps it as a browser-session cookie.",
        setHeader: "Set-Cookie: poc_session=tab-or-browser-session; Path=/; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_session=tab-or-browser-session; Path=/; SameSite=Lax'",
        action: () => setCookie("poc_session", "tab-or-browser-session", { sameSite: "Lax" }),
        notes: [
          "A session cookie is not automatically HttpOnly.",
          "It disappears when the browser session ends, depending on browser restore behavior.",
        ],
      },
      {
        title: "Persistent cookie with Max-Age",
        description: "Max-Age defines lifetime in seconds and is usually clearer than Expires.",
        setHeader: "Set-Cookie: poc_max_age=one-hour; Path=/; Max-Age=3600; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_max_age=one-hour; Path=/; Max-Age=3600; SameSite=Lax'",
        action: () => setCookie("poc_max_age", "one-hour", { maxAgeSeconds: 3600 }),
        notes: [
          "Good for short-lived preferences or demos.",
          "For auth cookies, keep lifetimes intentional and rotate server-side credentials.",
        ],
      },
      {
        title: "Persistent cookie with Expires",
        description: "Expires defines an absolute UTC expiration date.",
        setHeader: `Set-Cookie: poc_expires=absolute-time; Path=/; Expires=${nowPlus(3600).toUTCString()}; SameSite=Lax`,
        documentCookie: "document.cookie = 'poc_expires=absolute-time; Path=/; Expires=<UTC date>; SameSite=Lax'",
        action: () => setCookie("poc_expires", "absolute-time", { expires: nowPlus(3600) }),
        notes: [
          "If both Max-Age and Expires are present, Max-Age takes precedence in modern browsers.",
          "Expires depends on date parsing; Max-Age is usually simpler.",
        ],
      },
      {
        title: "SameSite=Lax",
        description: "Default safe middle ground for many first-party web sessions.",
        setHeader: "Set-Cookie: poc_lax=yes; Path=/; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_lax=yes; Path=/; SameSite=Lax'",
        action: () => setCookie("poc_lax", "yes", { sameSite: "Lax" }),
        notes: [
          "Sent on same-site requests and top-level cross-site navigations.",
          "Blocks many automatic cross-site POST/form/image/iframe scenarios.",
        ],
      },
      {
        title: "SameSite=Strict",
        description: "Most restrictive SameSite mode.",
        setHeader: "Set-Cookie: poc_strict=yes; Path=/; SameSite=Strict",
        documentCookie: "document.cookie = 'poc_strict=yes; Path=/; SameSite=Strict'",
        action: () => setCookie("poc_strict", "yes", { sameSite: "Strict" }),
        notes: [
          "Best when the cookie should only be sent from your own site context.",
          "May break flows that arrive from external links, SSO, or cross-site redirects.",
        ],
      },
      {
        title: "SameSite=None + Secure",
        description: "Allows cross-site cookie usage. Browsers require Secure with SameSite=None.",
        setHeader: "Set-Cookie: poc_none=cross-site; Path=/; SameSite=None; Secure",
        documentCookie: "document.cookie = 'poc_none=cross-site; Path=/; SameSite=None; Secure'",
        action: () => setCookie("poc_none", "cross-site", { sameSite: "None", secure: true }),
        notes: [
          "Use only when third-party/cross-site cookie behavior is required.",
          "It needs HTTPS; on plain HTTP it may not be stored or sent.",
        ],
      },
      {
        title: "Secure",
        description: "Only sends the cookie over HTTPS.",
        setHeader: "Set-Cookie: poc_secure=https-only; Path=/; Secure; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_secure=https-only; Path=/; Secure; SameSite=Lax'",
        action: () => setCookie("poc_secure", "https-only", { secure: true }),
        notes: [
          "Use for every sensitive cookie in production.",
          "On local HTTP dev servers, behavior can vary by browser and localhost treatment.",
        ],
      },
      {
        title: "Path-restricted cookie",
        description: "Restricts where the browser sends the cookie.",
        setHeader: "Set-Cookie: poc_refresh_path=only-refresh; Path=/auth/refresh; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_refresh_path=only-refresh; Path=/auth/refresh; SameSite=Lax'",
        action: () => setCookie("poc_refresh_path", "only-refresh", { path: "/auth/refresh" }),
        notes: [
          "A refresh-token cookie can use Path=/auth/refresh so it is not sent to every endpoint.",
          "You must delete it with the same Path used to create it.",
        ],
      },
      {
        title: "Priority=High",
        description: "Hints that the browser should keep this cookie before lower-priority cookies.",
        setHeader: "Set-Cookie: poc_priority=important; Path=/; SameSite=Lax; Priority=High",
        documentCookie: "document.cookie = 'poc_priority=important; Path=/; SameSite=Lax; Priority=High'",
        action: () => setCookie("poc_priority", "important", { priority: "High" }),
        notes: [
          "This is not a primary security control.",
          "Useful for important session cookies when browsers enforce cookie limits.",
        ],
      },
      {
        title: "HttpOnly auth cookie",
        description: "This must be created by the server. JavaScript cannot set HttpOnly.",
        setHeader: "Set-Cookie: refresh_token=<opaque-token>; HttpOnly; Secure; SameSite=Lax; Path=/auth/refresh; Max-Age=604800; Priority=High",
        notes: [
          "It will not appear in document.cookie.",
          "Use for session IDs and refresh tokens.",
        ],
      },
      {
        title: "Domain-scoped cookie",
        description: "Controls which hostnames receive the cookie.",
        setHeader: "Set-Cookie: shared=value; Domain=example.com; Path=/; SameSite=Lax",
        notes: [
          "Prefer host-only cookies by omitting Domain when possible.",
          "A broad Domain can expose cookies to subdomains you do not fully trust.",
        ],
      },
      {
        title: "Delete a cookie",
        description: "Deletion is done by setting Max-Age=0 or an expired Expires date.",
        setHeader: "Set-Cookie: poc_basic=; Path=/; Max-Age=0; SameSite=Lax",
        documentCookie: "document.cookie = 'poc_basic=; Path=/; Max-Age=0; SameSite=Lax'",
        action: () => deleteCookie("poc_basic"),
        notes: [
          "Name, Path, and Domain must match the original cookie.",
          "If deletion does not work, check whether the original Path or Domain differs.",
        ],
      },
    ],
    [],
  );

  const serverOnlyExamples = [
    {
      title: "CSRF token with session cookie",
      code: [
        "Set-Cookie: session_id=<opaque-id>; HttpOnly; Secure; SameSite=Lax; Path=/",
        "Set-Cookie: csrf_token=<random>; Secure; SameSite=Lax; Path=/",
        "",
        "POST /transfer",
        "Cookie: session_id=<opaque-id>; csrf_token=<random>",
        "X-CSRF-Token: <same-random-token>",
      ].join("\n"),
      note: "The backend accepts the mutation only when the CSRF header/body token matches the expected token.",
    },
    {
      title: "CSP header",
      code: [
        "Content-Security-Policy:",
        "  default-src 'self';",
        "  script-src 'self';",
        "  connect-src 'self' https://api.example.com;",
        "  img-src 'self' data:;",
        "  object-src 'none';",
        "  base-uri 'self';",
        "  frame-ancestors 'none'",
      ].join("\n"),
      note: "CSP is an HTTP response header. It limits what the page can load and reduces XSS impact.",
    },
  ];

  function refresh() {
    setCookies(getReadableCookies());
  }

  function clearExampleCookies() {
    [
      "poc_basic",
      "poc_session",
      "poc_max_age",
      "poc_expires",
      "poc_lax",
      "poc_strict",
      "poc_none",
      "poc_secure",
      "poc_priority",
    ].forEach((name) => deleteCookie(name));
    deleteCookie("poc_refresh_path", "/auth/refresh");
    refresh();
  }

  return (
    <>
      <header>
        <h1>Cookie examples</h1>
        <p>
          These examples show what JavaScript can create, what must come from the server, and what
          you can inspect through document.cookie.
        </p>
        <nav className="nav">
          <a href="#/">Storage/auth overview</a>
          <a href="#/auth">Real auth flow</a>
          <a href="#/cookies">Cookie examples</a>
        </nav>
      </header>

      <section>
        <h2>Current document.cookie readout</h2>
        <div className="actions">
          <button onClick={refresh}>Refresh cookies</button>
          <button className="danger" onClick={clearExampleCookies}>Clear example cookies</button>
        </div>
        <pre>{format(cookies)}</pre>
      </section>

      <section>
        <h2>JavaScript and Set-Cookie examples</h2>
        <div className="examples">
          {examples.map((example) => (
            <article key={example.title}>
              <h3>{example.title}</h3>
              <p>{example.description}</p>
              <strong>Server Set-Cookie</strong>
              <pre>{example.setHeader}</pre>
              {example.documentCookie ? (
                <>
                  <strong>JavaScript equivalent</strong>
                  <pre>{example.documentCookie}</pre>
                </>
              ) : null}
              <ul>
                {example.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
              {example.action ? (
                <button
                  onClick={() => {
                    example.action?.();
                    refresh();
                  }}
                >
                  Run example
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Server-only security examples</h2>
        <div className="examples">
          {serverOnlyExamples.map((example) => (
            <article key={example.title}>
              <h3>{example.title}</h3>
              <pre>{example.code}</pre>
              <p>{example.note}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
