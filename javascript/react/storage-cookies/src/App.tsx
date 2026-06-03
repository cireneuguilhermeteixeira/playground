import { useEffect, useMemo, useState } from "react";
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
    where: "Cookie HttpOnly + Secure + SameSite, gerenciado pelo servidor.",
    use: "Apps web tradicionais, BFF, SSR, apps que precisam reduzir exposicao a XSS.",
    avoid: "APIs consumidas por muitos clientes nao-browser sem gateway claro.",
  },
  {
    type: "Bearer access token",
    where: "Header Authorization: Bearer <token>.",
    use: "SPAs chamando APIs, mobile, CLI, integracoes servidor-servidor.",
    avoid: "Guardar token longo em localStorage. Prefira access token curto em memoria.",
  },
  {
    type: "JWT",
    where: "Formato de token assinado com claims; nao e um lugar de armazenamento.",
    use: "Quando a API precisa validar claims sem consultar sessao a cada request.",
    avoid: "Claims sensiveis, token longo sem revogacao, confiar em JWT sem validar assinatura.",
  },
  {
    type: "Refresh token",
    where: "Cookie HttpOnly ou storage seguro do dispositivo.",
    use: "Renovar access tokens curtos sem pedir login toda hora.",
    avoid: "Enviar para toda API. Restrinja ao endpoint de refresh.",
  },
  {
    type: "API key",
    where: "Header proprio, secret manager ou variavel de ambiente no backend.",
    use: "Integracao servidor-servidor e identificacao de aplicacoes.",
    avoid: "Frontend publico. API key no browser nao e segredo.",
  },
  {
    type: "Basic auth",
    where: "Header Authorization com usuario:senha em Base64 sobre HTTPS.",
    use: "Ferramentas internas simples, testes, endpoints legados.",
    avoid: "Apps modernos de usuario final sem controles adicionais.",
  },
  {
    type: "OAuth 2.0 / OIDC",
    where: "Authorization Code + PKCE no browser; tokens emitidos por Identity Provider.",
    use: "Login social, SSO corporativo, autorizacao delegada e apps SPA/mobile.",
    avoid: "Implicit flow legado. Use Authorization Code com PKCE.",
  },
  {
    type: "mTLS",
    where: "Certificado de cliente na conexao TLS.",
    use: "Comunicacao servidor-servidor de alta confianca.",
    avoid: "SPAs e usuarios finais comuns.",
  },
];

const storageMatrix = [
  {
    name: "localStorage",
    duration: "Persiste ate remocao manual.",
    scope: "Mesmo origin, compartilhado entre abas.",
    good: "Preferencias nao sensiveis, cache leve, flags locais.",
    risk: "Acessivel por JavaScript; XSS consegue ler.",
  },
  {
    name: "sessionStorage",
    duration: "Dura enquanto a aba/janela existir.",
    scope: "Mesmo origin, isolado por aba.",
    good: "Estado temporario de fluxo, wizard, filtros da aba.",
    risk: "Tambem acessivel por JavaScript; nao resolve XSS.",
  },
  {
    name: "cookie",
    duration: "Sessao do browser ou Max-Age/Expires.",
    scope: "Enviado automaticamente em requests que combinam Domain/Path/SameSite.",
    good: "Sessao web, refresh token HttpOnly, preferencias pequenas.",
    risk: "CSRF se SameSite/CSRF token forem mal configurados; limite pequeno.",
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

  function createLocalStorageDemo() {
    writeStorage(
      "localStorage",
      keys.local,
      buildRecord("localStorage", {
        theme: "dark",
        language: "pt-BR",
        note: "permanece depois de fechar e abrir o navegador",
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
        tabScopedDraft: "rascunho exclusivo desta aba",
        note: "some quando esta aba for encerrada",
      }),
    );
    refresh();
  }

  function createCookieDemo() {
    setCookie("poc_theme", "compact", 60 * 60);
    setCookie("poc_session_hint", "browser-session");
    setCookie("poc_refresh_demo", "simulado-no-js", 60 * 5);
    refresh();
  }

  function createJwtDemo() {
    const now = Math.floor(Date.now() / 1000);
    const token = createUnsignedJwt({
      sub: "user-123",
      role: "admin",
      iat: now,
      exp: now + 15 * 60,
      note: "JWT demonstra estrutura, nao seguranca. Assinatura real deve ser validada no backend/API.",
    });
    window.localStorage.setItem(keys.jwt, token);
    setDecodedJwt(decodeJwt(token));
    refresh();
  }

  function decodeStoredJwt() {
    if (!snapshot.jwt) {
      setDecodedJwt({ error: "Nenhum JWT salvo." });
      return;
    }

    try {
      setDecodedJwt(decodeJwt(snapshot.jwt));
    } catch (error) {
      setDecodedJwt({ error: error instanceof Error ? error.message : String(error) });
    }
  }

  function clearCookies() {
    cookieNames.forEach(deleteCookie);
    refresh();
  }

  function clearAll() {
    clearPocStorage();
    clearCookies();
    setDecodedJwt(null);
    refresh();
  }

  return (
    <main>
      <header>
        <h1>POC: localStorage, sessionStorage, cookies e autenticacao</h1>
        <p>
          Teste cada mecanismo no navegador, recarregue a pagina, abra outra aba e compare o que
          permanece, o que some e o que e enviado automaticamente.
        </p>
      </header>

      <section>
        <h2>1. Comparacao rapida</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Duracao</th>
                <th>Escopo</th>
                <th>Use para</th>
                <th>Risco principal</th>
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
        <h2>2. Experimentos executaveis</h2>
        <div className="actions">
          <button onClick={createLocalStorageDemo}>Gravar localStorage</button>
          <button onClick={createSessionStorageDemo}>Gravar sessionStorage</button>
          <button onClick={createCookieDemo}>Criar cookies</button>
          <button onClick={createJwtDemo}>Gerar JWT demo</button>
          <button onClick={decodeStoredJwt}>Decodificar JWT</button>
          <button onClick={refresh}>Atualizar leitura</button>
          <button className="danger" onClick={clearAll}>Limpar POC</button>
        </div>
        <div className="grid">
          <article>
            <h3>localStorage</h3>
            <p>Recarregue a pagina ou abra outra aba: o valor continua disponivel.</p>
            <pre>{format(snapshot.local)}</pre>
            <button onClick={() => {
              removeStorage("localStorage", keys.local);
              refresh();
            }}>Remover localStorage</button>
          </article>
          <article>
            <h3>sessionStorage</h3>
            <p>Recarregue a mesma aba: permanece. Abra outra aba: nao aparece.</p>
            <pre>{format(snapshot.session)}</pre>
            <button onClick={() => {
              removeStorage("sessionStorage", keys.session);
              refresh();
            }}>Remover sessionStorage</button>
          </article>
          <article>
            <h3>cookies visiveis por JS</h3>
            <p>
              Estes cookies sao demonstrativos. Cookies HttpOnly reais nao aparecem aqui e devem ser
              criados pelo servidor.
            </p>
            <pre>{format(snapshot.cookies)}</pre>
            <button onClick={clearCookies}>Remover cookies da POC</button>
          </article>
          <article>
            <h3>JWT demo</h3>
            <p>JWT e um formato. Armazenar no browser e uma decisao separada.</p>
            <pre>{snapshot.jwt ?? "null"}</pre>
            <pre>{format(decodedJwt)}</pre>
            <button onClick={() => {
              window.localStorage.removeItem(keys.jwt);
              setDecodedJwt(null);
              refresh();
            }}>Remover JWT</button>
          </article>
        </div>
      </section>

      <section>
        <h2>3. Onde guardar tokens</h2>
        <ul className="rules">
          <li><strong>Access token curto:</strong> preferencialmente em memoria. Se a pagina recarregar, renove usando refresh token.</li>
          <li><strong>Refresh token web:</strong> cookie HttpOnly, Secure, SameSite=Lax/Strict; envie apenas para o endpoint de refresh.</li>
          <li><strong>JWT:</strong> trate como credencial se ele autoriza acesso. Nao coloque dados sensiveis no payload.</li>
          <li><strong>localStorage:</strong> aceitavel para preferencias e cache nao sensivel; ruim para tokens de longa duracao.</li>
          <li><strong>sessionStorage:</strong> reduz persistencia, mas continua exposto a XSS.</li>
          <li><strong>cookie de sessao:</strong> bom para apps web quando o backend controla a sessao e aplica CSRF/SameSite.</li>
        </ul>
      </section>

      <section>
        <h2>4. Tipos de autenticacao e quando usar</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Onde fica / como viaja</th>
                <th>Quando usar</th>
                <th>Evite quando</th>
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
        <h2>5. Fluxos recomendados</h2>
        <div className="flow">
          <h3>SPA + API propria</h3>
          <ol>
            <li>Login via Authorization Code + PKCE ou endpoint proprio.</li>
            <li>Backend define refresh token em cookie HttpOnly Secure SameSite.</li>
            <li>Frontend mantem access token curto em memoria.</li>
            <li>API recebe Authorization Bearer e valida assinatura, exp, aud, iss e escopos.</li>
            <li>Ao expirar, frontend chama /refresh; cookie vai automatico; novo access token volta.</li>
          </ol>
        </div>
        <div className="flow">
          <h3>SSR/BFF</h3>
          <ol>
            <li>Usuario autentica no servidor.</li>
            <li>Servidor cria sessao e envia cookie HttpOnly.</li>
            <li>Browser envia cookie automaticamente a cada request do mesmo site.</li>
            <li>Servidor busca a sessao, aplica CSRF quando necessario e chama APIs internas.</li>
          </ol>
        </div>
        <div className="flow">
          <h3>Servidor-servidor</h3>
          <ol>
            <li>Use OAuth client credentials, mTLS ou API key guardada em secret manager.</li>
            <li>Nunca exponha esse segredo no bundle React.</li>
            <li>Rotacione credenciais e registre auditoria por cliente.</li>
          </ol>
        </div>
      </section>
    </main>
  );
}

export default App;
