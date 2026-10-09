# Traço → Espaço

Exemplos independentes e progressivos para aprender Three.js antes de construir um conversor de plantas em modelos 3D.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite no navegador. Para gerar a versão estática, use `npm run build`.

## Passo a passo

1. **Hello world** (`/`): um cubo estático. Cena, câmera, malha e renderizador em [`examples/01-hello.js`](examples/01-hello.js).
2. **Animação** (`/examples/02-animacao.html`): o mesmo cubo com um loop de renderização em [`examples/02-animacao.js`](examples/02-animacao.js).
3. **Luz e câmera** (`/examples/03-luz-camera.html`): material iluminado, duas luzes e controle orbital em [`examples/03-luz-camera.js`](examples/03-luz-camera.js).
4. **Planta 3D** (`/examples/04-planta.html`): segmentos 2D viram paredes 3D em [`examples/04-planta.js`](examples/04-planta.js).
5. **Janela de madeira** (`/examples/05-janela.html`): abertura quadrada na parede e caixilho com vidro, travessas e peitoril em [`examples/05-janela.js`](examples/05-janela.js).
6. **Laboratório** (`/lab.html`): a POC interativa anterior, com altura variável, grade e vistas em [`src/main.js`](src/main.js).

Cada passo funciona sozinho: abra seu arquivo JavaScript, altere um valor e veja o resultado no navegador. O código se repete de propósito para facilitar a comparação entre as etapas. As aberturas nas plantas são intervalos entre segmentos. Ainda não há leitura de imagem, PDF ou arquivo CAD.

## Caminho para a conversão real

1. Definir um formato de planta (por exemplo, JSON com escala, paredes e aberturas).
2. Validar unidades, fechamento de ambientes e interseções.
3. Extrudar paredes e inserir portas/janelas como objetos próprios.
4. Só então adicionar importação de SVG/DXF ou interpretação de imagem raster.
