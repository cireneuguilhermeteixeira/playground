const steps = [
  {
    url: '/', label: '01 Hello world', title: 'Um cubo na tela.', subtitle: 'PASSO 01 · HELLO WORLD',
    intro: 'Este é o menor exemplo útil de Three.js. Ele cria uma cena, uma câmera, um cubo e um renderizador. Depois desenha um único quadro.',
    points: ['<strong>Scene</strong> guarda os objetos.', '<strong>Camera</strong> define de onde olhamos.', '<strong>Mesh</strong> combina forma e aparência.', '<strong>Renderer</strong> desenha a cena no navegador.'],
    note: 'Abra <code>examples/01-hello.js</code> e altere a cor do cubo ou a posição da câmera. Recarregue para ver o resultado.',
    caption: 'Um cubo. Uma renderização.', next: 'Próximo: fazer o cubo girar →',
  },
  {
    url: '/examples/02-animacao.html', label: '02 Animação', title: 'Agora ele se move.', subtitle: 'PASSO 02 · ANIMAÇÃO',
    intro: 'O cubo é o mesmo. A diferença é que mudamos sua rotação e desenhamos a cena repetidamente com <code>setAnimationLoop</code>.',
    points: ['Leia o tempo transcorrido.', 'Atualize a rotação do cubo.', 'Renderize o novo quadro.'],
    note: 'Em <code>examples/02-animacao.js</code>, mude o multiplicador da rotação. Um valor maior faz o cubo girar mais rápido.',
    caption: 'O mesmo cubo, redesenhado a cada quadro.', next: 'Próximo: luz e câmera →',
  },
  {
    url: '/examples/03-luz-camera.html', label: '03 Luz e câmera', title: 'Forma, luz e ponto de vista.', subtitle: 'PASSO 03 · LUZ E CÂMERA',
    intro: 'O material básico ignora a iluminação. Com <code>MeshStandardMaterial</code>, luz ambiente e luz direcional, as faces do cubo ganham tons diferentes.',
    points: ['<strong>Material</strong> reage à luz.', '<strong>Luz ambiente</strong> clareia toda a cena.', '<strong>Luz direcional</strong> destaca um lado.', '<strong>OrbitControls</strong> permite girar a câmera.'],
    note: 'Arraste no modelo para girar a câmera. Abra <code>examples/03-luz-camera.js</code> e experimente mover a luz.',
    caption: 'Arraste para orbitar. Use a roda para aproximar.', next: 'Próximo: construir paredes →',
  },
  {
    url: '/examples/04-planta.html', label: '04 Planta 3D', title: 'Linhas viram paredes.', subtitle: 'PASSO 04 · DA PLANTA AO 3D',
    intro: 'Uma planta simples pode ser uma lista de segmentos. Cada segmento tem dois pontos 2D. Seu comprimento, ponto central e ângulo posicionam uma caixa 3D.',
    points: ['Defina as extremidades <strong>A</strong> e <strong>B</strong>.', 'Calcule comprimento e ângulo.', 'Crie uma caixa com a altura desejada.', 'Posicione e gire a caixa.'],
    note: 'Em <code>examples/04-planta.js</code>, altere um ponto da lista <code>walls</code> ou o valor <code>height</code>. O intervalo na parede frontal é uma porta.',
    caption: 'Arraste para orbitar na vista 3D.', next: 'Próximo: abrir uma janela →',
  },
  {
    url: '/examples/05-janela.html', label: '05 Janela', title: 'Uma abertura de verdade.', subtitle: 'PASSO 05 · JANELA DE MADEIRA',
    intro: 'Primeiro dividimos a parede em quatro partes para deixar um vão quadrado de 1,2 × 1,2 m. Depois encaixamos uma janela com moldura de madeira, vidro, divisórias e peitoril.',
    points: ['<strong>Abertura:</strong> duas laterais, uma parte abaixo e outra acima do vão.', '<strong>Caixilho:</strong> quatro peças de madeira contornam o quadrado.', '<strong>Detalhes:</strong> vidro, travessas, puxador e peitoril.'],
    note: 'Use os botões para comparar as duas etapas. O código está em <code>examples/05-janela.js</code>; mude <code>windowSize</code> e as peças da abertura para experimentar outras medidas.',
    caption: 'A janela está na parede da direita. Arraste para observar por dentro e por fora.', next: 'Próximo: explorar o laboratório →',
  },
  { url: '/lab.html', label: '06 Laboratório' },
];

const app = document.querySelector('#app');
const index = Number(app.dataset.step);
const step = steps[index];
app.innerHTML = `<main class="page">
  <header class="top"><a href="/">THREE.JS / PASSO A PASSO</a><span>${String(index + 1).padStart(2, '0')} / ${String(steps.length).padStart(2, '0')}</span></header>
  <nav class="steps" aria-label="Etapas">${steps.map((item, i) => `<a href="${item.url}" ${i === index ? 'class="current" aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav>
  <div class="content">
    <section class="explanation"><p class="eyebrow">${step.subtitle}</p><h1>${step.title}</h1><p>${step.intro}</p>
      <ol>${step.points.map((point) => `<li>${point}</li>`).join('')}</ol>
      <p class="note">${step.note}</p><a class="next" href="${steps[index + 1].url}">${step.next}</a>
    </section>
    <section class="demo" aria-label="Exemplo Three.js"><div id="scene"></div>${index === 3 ? '<div class="demo-controls" role="group" aria-label="Vista do modelo"><button id="perspective" class="active" type="button" aria-pressed="true">Vista 3D</button><button id="top" type="button" aria-pressed="false">Vista superior</button></div>' : ''}${index === 4 ? '<div class="demo-controls" role="group" aria-label="Etapa da janela"><button id="opening" type="button" aria-pressed="false">1. Abertura quadrada</button><button id="finished-window" class="active" type="button" aria-pressed="true">2. Janela de madeira</button></div>' : ''}<p>${step.caption}</p></section>
  </div>
</main>`;
