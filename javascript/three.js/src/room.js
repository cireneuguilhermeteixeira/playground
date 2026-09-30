import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const mount = document.querySelector('#room-canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#b8c1c3');

const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 60);
camera.rotation.order = 'YXZ';
camera.position.set(0.15, 1.65, 2.65);
let yaw = -0.07;
let pitch = matchMedia('(max-width: 700px)').matches ? -0.17 : -0.03;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
mount.appendChild(renderer.domElement);

const mat = (color, roughness = 0.82, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
const ivory = mat('#e6e4df');
const warmWhite = mat('#f2eee7');
const coral = mat('#d56859');
const coralSeam = mat('#ad514b');
const walnut = mat('#704438', 0.68);
const paleWood = mat('#ad805d', 0.72);
const metal = mat('#38383b', 0.38, { metalness: 0.55 });

function box(w, h, d, x, y, z, material, cast = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function rounded(w, h, d, x, y, z, material, radius = 0.06) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function woodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#9a785d';
  ctx.fillRect(0, 0, 1024, 1024);
  let seed = 81;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let row = 0; row < 13; row++) {
    const y = row * 80;
    ctx.fillStyle = row % 2 ? '#aa8668' : '#a48061';
    ctx.fillRect(0, y, 1024, 79);
    ctx.fillStyle = '#6f5747';
    ctx.fillRect(0, y, 1024, 2);
    for (let j = 0; j < 42; j++) {
      ctx.strokeStyle = `rgba(61,39,25,${0.025 + random() * 0.09})`;
      ctx.lineWidth = 0.5 + random() * 2;
      ctx.beginPath();
      const yy = y + random() * 78;
      ctx.moveTo(0, yy);
      ctx.bezierCurveTo(300, yy + random() * 9, 710, yy - random() * 9, 1024, yy + random() * 5);
      ctx.stroke();
    }
  }
  for (let row = 0; row < 13; row++) {
    ctx.fillStyle = '#6f5747';
    for (let x = (row % 2) * 250; x < 1024; x += 510) ctx.fillRect(x, row * 80, 2, 80);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 7),
  new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.86 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Quarto: 8 × 7 × 3,2 m. O lado z positivo fica atrás da câmera inicial.
box(8, 3.2, 0.14, 0, 1.6, -3.5, coral, false);
box(8, 3.2, 0.14, 0, 1.6, 3.5, warmWhite, false);
box(0.14, 3.2, 7, -4, 1.6, 0, ivory, false);
box(8, 0.12, 7, 0, 3.26, 0, new THREE.MeshBasicMaterial({ color: '#eeebe7' }), false);

// Parede direita com vão de janela de 2,7 m de largura.
box(0.14, 3.2, 3.3, 4, 1.6, -1.85, ivory, false);
box(0.14, 3.2, 0.75, 4, 1.6, 3.13, ivory, false);
box(0.14, 0.78, 2.7, 4, 0.39, 1.15, ivory, false);
box(0.14, 0.56, 2.7, 4, 2.92, 1.15, ivory, false);

// Painéis, rodapé e luz indireta na parede coral.
for (let x = -3.6; x <= 3.6; x += 0.8) box(0.012, 2.82, 0.018, x, 1.55, -3.409, coralSeam, false);
box(7.86, 0.018, 0.025, 0, 1.16, -3.405, coralSeam, false);
box(7.86, 0.07, 0.07, 0, 0.07, -3.39, warmWhite, false);
const led = new THREE.MeshBasicMaterial({ color: '#fff1d3' });
box(7.65, 0.028, 0.04, 0, 3.025, -3.38, led, false);
box(7.7, 0.05, 0.05, 0, 3.16, 3.36, warmWhite, false);
box(0.05, 0.05, 6.7, -3.86, 3.16, 0, warmWhite, false);
box(0.05, 0.05, 6.7, 3.86, 3.16, 0, warmWhite, false);

// Janela: vidro, caixilho escuro, paisagem clara e cortinas translúcidas.
const sky = new THREE.MeshBasicMaterial({ color: '#d5e6e9' });
box(0.018, 1.88, 2.72, 4.045, 1.73, 1.15, sky, false);
const glass = new THREE.MeshPhysicalMaterial({ color: '#d8eaf0', transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false });
box(0.025, 1.83, 2.67, 3.95, 1.72, 1.15, glass, false);
for (const z of [-0.2, 1.15, 2.5]) box(0.09, 1.93, 0.055, 3.93, 1.72, z, metal, false);
for (const y of [0.79, 2.67]) box(0.09, 0.055, 2.75, 3.93, y, 1.15, metal, false);
box(0.12, 0.075, 2.9, 3.87, 0.8, 1.15, warmWhite, false);
const curtainMat = mat('#f7eee0', 0.95, { transparent: true, opacity: 0.73, side: THREE.DoubleSide });
for (const side of [-1, 1]) {
  const start = side < 0 ? -0.12 : 2.35;
  for (let i = 0; i < 5; i++) {
    const strip = box(0.035, 2.58, 0.16, 3.75 - (i % 2) * 0.035, 1.51, start + i * 0.12 * side, curtainMat, false);
    strip.material.side = THREE.DoubleSide;
  }
}
box(0.065, 0.065, 3.05, 3.72, 2.82, 1.15, metal, false);

// Tapete sob a cama, com borda simples.
const rugMat = mat('#919899', 1);
box(3.45, 0.025, 4.25, 0, 0.027, -0.82, rugMat, false);
const rugLine = mat('#c7cbca', 1);
for (const x of [-1.63, 1.63]) box(0.015, 0.005, 4.05, x, 0.043, -0.82, rugLine, false);
for (const z of [-2.84, 1.2]) box(3.26, 0.005, 0.015, 0, 0.043, z, rugLine, false);

// Cama, cabeceira, colchão, roupa de cama e almofadas.
rounded(2.78, 1.2, 0.18, 0, 1.04, -3.05, walnut, 0.08);
for (let i = -2; i <= 2; i++) box(0.012, 0.87, 0.018, i * 0.45, 1.07, -2.943, mat('#61392f'), false);
rounded(2.63, 0.38, 3.0, 0, 0.33, -1.55, mat('#c5c2bb'), 0.08);
rounded(2.55, 0.28, 2.93, 0, 0.66, -1.55, mat('#ece9e2'), 0.07);
rounded(2.47, 0.08, 2.75, 0, 0.84, -1.54, mat('#c8c8c6'), 0.035);
rounded(2.47, 0.1, 1.65, 0, 0.9, -0.9, mat('#dad9d6'), 0.04);
rounded(2.48, 0.06, 0.55, 0, 0.96, -0.19, mat('#a96252'), 0.025);
for (const x of [-0.63, 0.63]) {
  rounded(1.04, 0.15, 0.52, x, 0.98, -2.41, mat('#e1e0df'), 0.06);
  rounded(0.78, 0.16, 0.48, x, 1.04, -2.06, mat('#b6b8b8'), 0.055);
}
rounded(0.52, 0.16, 0.39, 0.02, 1.08, -1.78, mat('#bb7058'), 0.06);

// Mesas de cabeceira e luminárias quentes.
const lampLights = [];
for (const side of [-1, 1]) {
  const x = side * 1.82;
  rounded(0.63, 0.47, 0.53, x, 0.47, -2.55, warmWhite, 0.025);
  box(0.67, 0.035, 0.57, x, 0.72, -2.55, walnut);
  box(0.36, 0.018, 0.012, x, 0.45, -2.275, paleWood, false);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.48, 16), new THREE.MeshBasicMaterial({ color: '#ffe4be' }));
  lamp.position.set(x, 1.26, -3.26);
  scene.add(lamp);
  const lampLight = new THREE.PointLight('#ffcd9a', 2.1, 2.7, 2);
  lampLight.position.set(x, 1.25, -3.04);
  scene.add(lampLight);
  lampLights.push(lampLight);
}

// Armário embutido com portas de vidro fumê à esquerda.
box(1.58, 2.78, 0.76, -3.1, 1.39, -2.96, warmWhite);
const smokedGlass = mat('#202832', 0.25, { metalness: 0.18 });
for (const x of [-3.47, -2.72]) {
  box(0.72, 2.56, 0.035, x, 1.41, -2.56, smokedGlass);
  box(0.018, 2.56, 0.047, x - 0.355, 1.41, -2.54, metal, false);
  box(0.018, 2.56, 0.047, x + 0.355, 1.41, -2.54, metal, false);
  box(0.018, 0.95, 0.07, x + 0.22, 1.38, -2.51, metal, false);
}

// Nicho aberto com cabideiro e roupas.
box(0.87, 2.78, 0.73, -1.84, 1.39, -3.02, warmWhite);
box(0.73, 2.52, 0.04, -1.84, 1.39, -2.64, mat('#e4dfd8'), false);
box(0.65, 0.045, 0.53, -1.84, 2.46, -2.92, warmWhite);
box(0.65, 0.045, 0.53, -1.84, 0.53, -2.92, warmWhite);
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.68, 12), metal);
rod.rotation.z = Math.PI / 2;
rod.position.set(-1.84, 2.28, -2.87);
scene.add(rod);
for (const [i, color] of ['#d8e0e1', '#5e7481', '#e3ddd2'].entries()) {
  const x = -2.07 + i * 0.22;
  box(0.16, 0.62, 0.2, x, 1.82, -2.88, mat(color));
  box(0.12, 0.1, 0.015, x, 2.18, -2.73, paleWood, false);
}
box(0.52, 0.28, 0.4, -1.84, 0.78, -2.95, paleWood);

// Estante à direita com livros, vasos e escultura simples.
box(0.66, 2.8, 0.52, 3.22, 1.4, -3.03, mat('#514f45'));
for (const y of [0.47, 1.22, 1.95, 2.62]) box(0.62, 0.035, 0.49, 3.22, y, -2.77, walnut);
for (let i = 0; i < 7; i++) box(0.06, 0.35 + (i % 3) * 0.05, 0.18, 3.02 + i * 0.07, 1.42, -2.77, mat(i % 2 ? '#d7c6a9' : '#e4dfcc'));
for (const y of [0.58, 2.07]) {
  const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 0.22, 16), mat('#c5bba7'));
  vase.position.set(3.23, y, -2.8);
  scene.add(vase);
}
const sculpture = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), mat('#e5d8bc'));
sculpture.position.set(3.22, 2.76, -2.79);
scene.add(sculpture);

// Iluminação principal e luz do dia que entra pela janela.
const ambient = new THREE.HemisphereLight('#dce9f0', '#8d6b55', 1.65);
scene.add(ambient);
const daylight = new THREE.DirectionalLight('#fff1d7', 2.5);
daylight.position.set(6, 5, 1);
daylight.castShadow = true;
daylight.shadow.mapSize.set(2048, 2048);
daylight.shadow.camera.left = -9;
daylight.shadow.camera.right = 9;
daylight.shadow.camera.top = 9;
daylight.shadow.camera.bottom = -9;
daylight.shadow.bias = -0.0003;
scene.add(daylight);
const ceilingLight = new THREE.PointLight('#fff1dd', 2.0, 12, 2);
ceilingLight.position.set(0, 2.9, 0);
scene.add(ceilingLight);

const timeSlider = document.querySelector('#time-slider');
function updateTime() {
  const hour = Number(timeSlider.value);
  const whole = Math.floor(hour);
  const minutes = Math.round((hour - whole) * 60);
  document.querySelector('#time-value').value = `${String(whole).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const sun = Math.max(0, Math.sin(((hour - 6) / 14) * Math.PI));
  daylight.intensity = 0.16 + sun * 3.1;
  daylight.color.set(hour < 9 || hour > 17 ? '#ffb37e' : '#fff0dd');
  ambient.intensity = 0.75 + sun * 1.15;
  ceilingLight.intensity = 2.25 - sun * 0.75;
  lampLights.forEach((lamp) => { lamp.intensity = 2.6 - sun * 1.3; });
  renderer.toneMappingExposure = 0.95 + sun * 0.4;
}
timeSlider.addEventListener('input', updateTime);
updateTime();

function resize() {
  const width = mount.clientWidth;
  const height = mount.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

const intro = document.querySelector('#intro');
const isTouch = matchMedia('(pointer: coarse)').matches;
let active = false;
const keys = new Set();
const touchKeys = new Set();

function applyLook(dx, dy) {
  yaw -= dx * 0.0022;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.0022, -1.22, 1.22);
  camera.rotation.set(pitch, yaw, 0);
}
applyLook(0, 0);

function start() {
  intro.hidden = true;
  active = true;
  if (!isTouch && renderer.domElement.requestPointerLock) renderer.domElement.requestPointerLock();
}
document.querySelector('#enter-button').addEventListener('click', start);
renderer.domElement.addEventListener('click', () => {
  if (active && !isTouch && document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock();
});
document.addEventListener('pointerlockchange', () => {
  if (!isTouch && document.pointerLockElement !== renderer.domElement && active) {
    active = false;
    keys.clear();
    intro.hidden = false;
    document.querySelector('#enter-button').innerHTML = 'Continuar explorando <b>↗</b>';
  }
});
document.addEventListener('mousemove', (event) => {
  if (document.pointerLockElement === renderer.domElement) applyLook(event.movementX, event.movementY);
});
window.addEventListener('keydown', (event) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft'].includes(event.code)) {
    keys.add(event.code);
    if (active) event.preventDefault();
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

let lastTouch = null;
renderer.domElement.addEventListener('touchstart', (event) => {
  if (active) lastTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
renderer.domElement.addEventListener('touchmove', (event) => {
  if (!active || !lastTouch) return;
  const touch = event.touches[0];
  applyLook((touch.clientX - lastTouch.x) * 1.25, (touch.clientY - lastTouch.y) * 1.25);
  lastTouch = { x: touch.clientX, y: touch.clientY };
  event.preventDefault();
}, { passive: false });
renderer.domElement.addEventListener('touchend', () => { lastTouch = null; });
for (const button of document.querySelectorAll('[data-move]')) {
  button.addEventListener('pointerdown', (event) => { button.setPointerCapture(event.pointerId); touchKeys.add(button.dataset.move); });
  button.addEventListener('pointerup', () => touchKeys.delete(button.dataset.move));
  button.addEventListener('pointercancel', () => touchKeys.delete(button.dataset.move));
}

const helpPanel = document.querySelector('#help-panel');
document.querySelector('#help-button').addEventListener('click', () => { helpPanel.hidden = !helpPanel.hidden; });
document.querySelector('#close-help').addEventListener('click', () => { helpPanel.hidden = true; });

// Paredes e móveis grandes são caixas de colisão no plano do piso.
const obstacles = [
  { minX: -1.48, maxX: 1.48, minZ: -3.18, maxZ: 0.04 }, // cama
  { minX: -3.95, maxX: -1.38, minZ: -3.48, maxZ: -2.5 }, // armário
  { minX: 2.82, maxX: 3.63, minZ: -3.49, maxZ: -2.5 }, // estante
  { minX: -2.2, maxX: -1.45, minZ: -2.9, maxZ: -2.2 },
  { minX: 1.45, maxX: 2.2, minZ: -2.9, maxZ: -2.2 },
];
function canStand(x, z) {
  const radius = 0.23;
  if (x < -3.72 || x > 3.72 || z < -3.21 || z > 3.2) return false;
  return !obstacles.some((item) => x + radius > item.minX && x - radius < item.maxX && z + radius > item.minZ && z - radius < item.maxZ);
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (active) {
    const forward = Number(keys.has('KeyW') || keys.has('ArrowUp') || touchKeys.has('forward')) - Number(keys.has('KeyS') || keys.has('ArrowDown') || touchKeys.has('backward'));
    const sideways = Number(keys.has('KeyD') || keys.has('ArrowRight') || touchKeys.has('right')) - Number(keys.has('KeyA') || keys.has('ArrowLeft') || touchKeys.has('left'));
    if (forward || sideways) {
      const length = Math.hypot(forward, sideways);
      const speed = keys.has('ShiftLeft') ? 3.5 : 2.1;
      const dx = ((-Math.sin(yaw) * forward + Math.cos(yaw) * sideways) / length) * speed * dt;
      const dz = ((-Math.cos(yaw) * forward - Math.sin(yaw) * sideways) / length) * speed * dt;
      if (canStand(camera.position.x + dx, camera.position.z)) camera.position.x += dx;
      if (canStand(camera.position.x, camera.position.z + dz)) camera.position.z += dz;
    }
  }
  renderer.render(scene, camera);
});
