import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';

const lessons = [
  {
    number: '01',
    label: 'Primeiros passos',
    title: 'Uma cena é um pequeno mundo.',
    description: 'Toda experiência em Three.js começa com três peças: uma cena para guardar objetos, uma câmera para observá-los e um renderizador para desenhar cada quadro.',
    concept: 'Cena + câmera + renderizador',
    code: `const scene = new THREE.Scene();\nconst camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);\nconst renderer = new THREE.WebGLRenderer({ antialias: true });\nrenderer.render(scene, camera);`,
    tip: 'Arraste para orbitar. Use a roda do mouse ou gesto de pinça para aproximar.',
  },
  {
    number: '02',
    label: 'Geometria e luz',
    title: 'Formas ganham profundidade com luz.',
    description: 'Geometria define a forma; material define como ela reage à luz. Piso e paredes são caixas com medidas reais, em metros, iluminadas por uma luz ambiente e uma direcional.',
    concept: 'Geometria + material + iluminação',
    code: `const geometry = new THREE.BoxGeometry(largura, altura, espessura);\nconst material = new THREE.MeshStandardMaterial({ color: 0xdce5e3 });\nconst parede = new THREE.Mesh(geometry, material);\nscene.add(parede);`,
    tip: 'Altere a altura das paredes abaixo para enxergar a geometria mudar.',
  },
  {
    number: '03',
    label: 'Da planta ao volume',
    title: 'Cada linha vira uma parede.',
    description: 'Uma planta pode ser representada como pontos e segmentos em 2D. Cada segmento fornece posição, comprimento e rotação de uma parede; a altura acrescenta a terceira dimensão.',
    concept: 'Pontos 2D → segmentos → volumes 3D',
    code: `const comprimento = Math.hypot(b.x - a.x, b.y - a.y);\nconst angulo = Math.atan2(b.y - a.y, b.x - a.x);\nparede.position.set((a.x + b.x) / 2, altura / 2, (a.y + b.y) / 2);\nparede.rotation.y = -angulo;`,
    tip: 'Troque para “Vista de planta” para comparar os segmentos 2D com o volume.',
  },
];

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <header class="brand"><span class="brand-symbol" aria-hidden="true">⌗</span><span>TRAÇO <b>→</b> ESPAÇO</span><span class="brand-tag">POC 01</span></header>
      <div class="intro"><p class="eyebrow">LABORATÓRIO THREE.JS</p><h1>Da planta<br>ao <em>espaço.</em></h1><p>Uma introdução interativa aos fundamentos de 3D na web — com arquitetura como ponto de partida.</p></div>
      <nav class="lesson-nav" aria-label="Etapas do laboratório"></nav>
      <section class="lesson-content" aria-live="polite"></section>
      <footer class="sidebar-footer"><span>EXPERIMENTO / 01</span><span>THREE.JS + WEBGL</span></footer>
    </aside>
    <main class="workspace">
      <div class="viewport" id="viewport" aria-label="Visualização 3D de uma planta arquitetônica">
        <div class="viewport-top"><span class="live-dot"></span><span>MODELO INTERATIVO</span><span class="viewport-top-right">ESCALA 1 UNIDADE = 1 METRO</span></div>
        <div class="viewport-caption"><span class="caption-index">FIG. 01 / ESTUDO ESPACIAL</span><strong>Casa de estudo</strong><span>8,0 × 6,0 m · 3 ambientes</span></div>
        <div class="axis-key"><span class="axis-x">X</span><span class="axis-y">Y</span><span class="axis-z">Z</span></div>
      </div>
      <div class="control-panel">
        <div class="control-head"><span>CONTROLES DO MODELO</span><span class="control-hint">ARRASTE PARA GIRAR · RODA PARA ZOOM</span></div>
        <div class="controls-row">
          <div class="view-control"><span class="control-label">CÂMERA</span><div class="segmented" role="group" aria-label="Tipo de vista"><button id="view-3d" class="active" type="button" aria-pressed="true">Vista 3D</button><button id="view-plan" type="button" aria-pressed="false">Vista de planta</button></div></div>
          <div class="height-control"><label class="control-label" for="wall-height">ALTURA DAS PAREDES <output id="height-value">2,7 m</output></label><input id="wall-height" type="range" min="0.2" max="3.6" value="2.7" step="0.1" /></div>
          <label class="grid-control"><input id="show-grid" type="checkbox" checked /><span class="switch" aria-hidden="true"></span><span>Mostrar grade</span></label>
        </div>
      </div>
    </main>
  </div>`;

const nav = document.querySelector('.lesson-nav');
const content = document.querySelector('.lesson-content');
let activeLesson = 0;

function showLesson(index) {
  activeLesson = index;
  nav.innerHTML = lessons.map((lesson, i) => `<button class="lesson-link ${i === index ? 'active' : ''}" type="button" data-lesson="${i}" ${i === index ? 'aria-current="step"' : ''}><span>${lesson.number}</span><strong>${lesson.label}</strong><span class="lesson-arrow">↗</span></button>`).join('');
  const lesson = lessons[index];
  content.innerHTML = `<p class="section-kicker">ETAPA ${lesson.number} / ${lessons.length.toString().padStart(2, '0')}</p><h2>${lesson.title}</h2><p class="lesson-description">${lesson.description}</p><div class="concept"><span>IDEIA-CHAVE</span><strong>${lesson.concept}</strong></div><div class="code-heading"><span>NO CÓDIGO</span><span>JAVASCRIPT</span></div><pre><code>${lesson.code}</code></pre><p class="tip"><span>↳ DICA</span>${lesson.tip}</p><div class="lesson-actions"><button type="button" id="prev-lesson" ${index === 0 ? 'disabled' : ''}>← Anterior</button><button type="button" id="next-lesson" ${index === lessons.length - 1 ? 'disabled' : ''}>Próxima etapa →</button></div>`;
  document.querySelector('#prev-lesson').addEventListener('click', () => showLesson(activeLesson - 1));
  document.querySelector('#next-lesson').addEventListener('click', () => showLesson(activeLesson + 1));
}
nav.addEventListener('click', (event) => {
  const button = event.target.closest('[data-lesson]');
  if (button) showLesson(Number(button.dataset.lesson));
});
showLesson(0);

const viewport = document.querySelector('#viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#172b37');
scene.fog = new THREE.Fog('#172b37', 17, 29);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewport.prepend(renderer.domElement);

const perspectiveCamera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
perspectiveCamera.position.set(10, 10, 11);
const planCamera = new THREE.OrthographicCamera(-6, 6, 5, -5, 0.1, 100);
planCamera.position.set(0, 16, 0.001);
planCamera.up.set(0, 0, -1);
let camera = perspectiveCamera;
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0);
controls.enableDamping = true;
controls.minDistance = 5;
controls.maxDistance = 25;
controls.maxPolarAngle = Math.PI / 2.05;
controls.update();

scene.add(new THREE.AmbientLight('#cde5ed', 1.25));
const sun = new THREE.DirectionalLight('#fff1d8', 2.8);
sun.position.set(-5, 12, 7);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
sun.shadow.normalBias = 0.02;
scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#203845', roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.09;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(30, 30, '#57737d', '#3c5661');
grid.position.y = -0.075;
grid.material.transparent = true;
grid.material.opacity = 0.42;
scene.add(grid);

const model = new THREE.Group();
scene.add(model);
const slab = new THREE.Mesh(new THREE.BoxGeometry(8.1, 0.16, 6.1), new THREE.MeshStandardMaterial({ color: '#8ba6a9', roughness: 0.9 }));
slab.position.y = -0.01;
slab.receiveShadow = true;
model.add(slab);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 5.8), new THREE.MeshStandardMaterial({ color: '#d7d7c9', roughness: 0.95, side: THREE.DoubleSide }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = 0.075;
floor.receiveShadow = true;
model.add(floor);

// Coordenadas da planta em metros: x corresponde a x; y da planta corresponde a z no 3D.
// As aberturas são representadas por intervalos sem segmentos de parede.
const wallSegments = [
  [[-4,-3],[-1.2,-3]], [[0.1,-3],[4,-3]],
  [[4,-3],[4,0.2]], [[4,1.4],[4,3]],
  [[4,3],[-4,3]], [[-4,3],[-4,-3]],
  [[0.6,-3],[0.6,-0.8]], [[0.6,0.2],[0.6,3]],
  [[0.6,0.5],[4,0.5]],
];
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#e5e7dc', roughness: 0.8 });
const walls = wallSegments.map(([a,b]) => {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(length, 1, 0.14), wallMaterial);
  mesh.position.set((a[0] + b[0]) / 2, 0.5, (a[1] + b[1]) / 2);
  mesh.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  model.add(mesh);
  return mesh;
});

// Marcas no piso ajudam a ler portas na vista superior.
const markerMaterial = new THREE.MeshBasicMaterial({ color: '#e9a872' });
for (const [x,z,w,d] of [[-0.55,-3,1.3,0.035],[0.6,-0.3,0.035,1],[4,0.8,0.035,1.2]]) {
  const marker = new THREE.Mesh(new THREE.BoxGeometry(w, 0.008, d), markerMaterial);
  marker.position.set(x, 0.085, z);
  model.add(marker);
}

function setWallHeight(value) {
  walls.forEach((wall) => {
    wall.scale.y = value;
    wall.position.y = value / 2 + 0.08;
  });
  document.querySelector('#height-value').textContent = `${value.toFixed(1).replace('.', ',')} m`;
}
const heightInput = document.querySelector('#wall-height');
heightInput.addEventListener('input', () => setWallHeight(Number(heightInput.value)));
setWallHeight(Number(heightInput.value));
document.querySelector('#show-grid').addEventListener('change', (event) => { grid.visible = event.target.checked; });

let planView = false;
function setView(isPlan) {
  planView = isPlan;
  camera = isPlan ? planCamera : perspectiveCamera;
  controls.object = camera;
  controls.target.set(0, isPlan ? 0 : 0.8, 0);
  controls.enableRotate = !isPlan;
  controls.enablePan = !isPlan;
  camera.updateProjectionMatrix();
  controls.update();
  for (const [id, active] of [['view-3d', !isPlan], ['view-plan', isPlan]]) {
    const button = document.querySelector(`#${id}`);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}
document.querySelector('#view-3d').addEventListener('click', () => setView(false));
document.querySelector('#view-plan').addEventListener('click', () => setView(true));

function resize() {
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  perspectiveCamera.aspect = width / height;
  perspectiveCamera.updateProjectionMatrix();
  const halfHeight = 5.5;
  const halfWidth = halfHeight * width / height;
  planCamera.left = -halfWidth;
  planCamera.right = halfWidth;
  planCamera.top = halfHeight;
  planCamera.bottom = -halfHeight;
  planCamera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(viewport);
resize();
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
