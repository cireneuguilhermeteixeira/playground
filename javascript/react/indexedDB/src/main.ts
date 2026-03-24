import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Elemento #app não encontrado.");
}

app.innerHTML = `
  <main class="container">
    <span class="eyebrow">Vite + TypeScript</span>
    <h1>Projeto simples pronto</h1>
    <p>
      Edite <code>src/main.ts</code> para começar.
    </p>
  </main>
`;
