# Traço → Espaço

POC interativa para aprender os fundamentos de Three.js antes de construir um conversor de plantas em modelos 3D.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL mostrada pelo Vite no navegador. Para gerar a versão estática, use `npm run build`.

## O que explorar

1. **Primeiros passos:** cena, câmera, renderizador e navegação orbital.
2. **Geometria e luz:** caixas, materiais, iluminação e altura das paredes.
3. **Da planta ao volume:** segmentos 2D posicionam e orientam paredes em 3D. Compare a vista superior com a vista em perspectiva.

O modelo é um exemplo definido no código em `src/main.js`. As aberturas são intervalos entre segmentos. Nesta etapa ainda não há leitura de imagem, PDF ou arquivo CAD.

## Caminho para a conversão real

1. Definir um formato de planta (por exemplo, JSON com escala, paredes e aberturas).
2. Validar unidades, fechamento de ambientes e interseções.
3. Extrudar paredes e inserir portas/janelas como objetos próprios.
4. Só então adicionar importação de SVG/DXF ou interpretação de imagem raster.
