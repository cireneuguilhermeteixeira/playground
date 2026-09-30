import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        hello: page('./index.html'),
        animation: page('./examples/02-animacao.html'),
        lighting: page('./examples/03-luz-camera.html'),
        floorplan: page('./examples/04-planta.html'),
        window: page('./examples/05-janela.html'),
        room: page('./quarto.html'),
        lab: page('./lab.html'),
      },
    },
  },
});
