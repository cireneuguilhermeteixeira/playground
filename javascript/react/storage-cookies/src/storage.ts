export type StorageKind = "localStorage" | "sessionStorage";

export type DemoRecord = {
  owner: string;
  createdAt: string;
  expiresAt?: string;
  payload: Record<string, unknown>;
};

const demoKeyPrefix = "storage-cookies-poc";

export const keys = {
  local: `${demoKeyPrefix}:local`,
  session: `${demoKeyPrefix}:session`,
  jwt: `${demoKeyPrefix}:jwt`,
};

export type CookieSameSite = "Lax" | "Strict" | "None";

export type CookieOptions = {
  path?: string;
  domain?: string;
  maxAgeSeconds?: number;
  expires?: Date;
  sameSite?: CookieSameSite;
  secure?: boolean;
  priority?: "Low" | "Medium" | "High";
};

export function buildRecord(owner: string, payload: Record<string, unknown>): DemoRecord {
  return {
    owner,
    createdAt: new Date().toISOString(),
    payload,
  };
}

export function readStorage(kind: StorageKind, key: string): DemoRecord | null {
  const raw = window[kind].getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as DemoRecord;
  } catch {
    return {
      owner: "invalid value",
      createdAt: new Date().toISOString(),
      payload: { raw },
    };
  }
}

export function writeStorage(kind: StorageKind, key: string, value: DemoRecord) {
  window[kind].setItem(key, JSON.stringify(value, null, 2));
}

export function removeStorage(kind: StorageKind, key: string) {
  window[kind].removeItem(key);
}

export function clearPocStorage() {
  Object.values(keys).forEach((key) => {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  });
}

export function setCookie(
  name: string,
  value: string,
  maxAgeSecondsOrOptions?: number | CookieOptions,
) {
  const options =
    typeof maxAgeSecondsOrOptions === "number"
      ? { maxAgeSeconds: maxAgeSecondsOrOptions }
      : maxAgeSecondsOrOptions ?? {};

  const attributes = [
    `Path=${options.path ?? "/"}`,
    options.domain ? `Domain=${options.domain}` : "",
    typeof options.maxAgeSeconds === "number" ? `Max-Age=${options.maxAgeSeconds}` : "",
    options.expires ? `Expires=${options.expires.toUTCString()}` : "",
    `SameSite=${options.sameSite ?? "Lax"}`,
    options.secure ? "Secure" : "",
    options.priority ? `Priority=${options.priority}` : "",
  ].filter(Boolean);

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    ...attributes,
  ].join("; ");
}

export function deleteCookie(name: string, path = "/") {
  document.cookie = `${encodeURIComponent(name)}=; Path=${path}; Max-Age=0; SameSite=Lax`;
}

export function getReadableCookies() {
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [name, ...value] = item.split("=");
      return {
        name: decodeURIComponent(name),
        value: decodeURIComponent(value.join("=")),
      };
    });
}

function base64UrlEncode(input: string) {
  return btoa(input).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(input: string) {
  const padded = input.padEnd(input.length + ((4 - (input.length % 4)) % 4), "=");
  return atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
}

export function createUnsignedJwt(payload: Record<string, unknown>) {
  const header = { alg: "none", typ: "JWT" };
  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(payload)),
    "demo-signature",
  ].join(".");
}

export function decodeJwt(token: string) {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("JWT must have a header, payload, and signature.");
  }

  return {
    header: JSON.parse(base64UrlDecode(header)),
    payload: JSON.parse(base64UrlDecode(payload)),
    signature,
  };
}
