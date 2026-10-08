import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#203b45');

const camera = new THREE.PerspectiveCamera(50, 8 / 5, 0.1, 100);
camera.position.set(6.2, 3.3, -4.5);

scene.add(new THREE.AmbientLight('#ffffff', 1.7));
const light = new THREE.DirectionalLight('#fff5e4', 2.5);
light.position.set(5, 9, -5);
light.castShadow = true;
light.shadow.mapSize.set(1024, 1024);
light.shadow.camera.left = -9;
light.shadow.camera.right = 9;
light.shadow.camera.top = 9;
light.shadow.camera.bottom = -9;
scene.add(light);

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.12, 4),
  new THREE.MeshStandardMaterial({ color: '#8cb4b2' }),
);
floor.receiveShadow = true;
scene.add(floor);

const wallHeight = 2.6;
const wallThickness = 0.12;
const wallMaterial = new THREE.MeshStandardMaterial({ color: '#e8e4d6' });

// Cada segmento completo vira uma parede, como no passo anterior.
function addWall(a, b, height = wallHeight, bottom = 0) {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(length, height, wallThickness),
    wallMaterial,
  );
  wall.position.set((a[0] + b[0]) / 2, bottom + height / 2, (a[1] + b[1]) / 2);
  wall.rotation.y = -angle;
  wall.castShadow = true;
  wall.receiveShadow = true;
  scene.add(wall);
}

// Perímetro, com uma porta na frente e uma abertura na parede direita.
addWall([-3, -2], [-0.5, -2]);
addWall([0.5, -2], [3, -2]);
addWall([3, 2], [-3, 2]);
addWall([-3, 2], [-3, -2]);
addWall([0, -2], [0, 0.2]);
addWall([0, 1.2], [0, 2]);

// ETAPA 1: um vão quadrado de 1,2 × 1,2 m, com peitoril a 0,8 m do piso.
// A parede é feita de quatro partes, deixando o centro realmente vazio.
const windowSize = 1.2;
const windowZ = -0.4;
const sillHeight = 0.8;
const windowStart = windowZ - windowSize / 2;
const windowEnd = windowZ + windowSize / 2;
addWall([3, -2], [3, windowStart]);
addWall([3, windowEnd], [3, 2]);
addWall([3, windowStart], [3, windowEnd], sillHeight);
addWall([3, windowStart], [3, windowEnd], wallHeight - sillHeight - windowSize, sillHeight + windowSize);

// ETAPA 2: caixilho de madeira, vidros e pequenos detalhes dentro do vão.
const windowGroup = new THREE.Group();
scene.add(windowGroup);
const wood = new THREE.MeshStandardMaterial({ color: '#965d35', roughness: 0.76 });
const darkWood = new THREE.MeshStandardMaterial({ color: '#6f4227', roughness: 0.8 });
const glass = new THREE.MeshPhysicalMaterial({
  color: '#9ccfdb', transparent: true, opacity: 0.42,
  metalness: 0, roughness: 0.08, side: THREE.DoubleSide, depthWrite: false,
});

function addWood(width, height, depth, x, y, z, material = wood) {
  const piece = new THREE.Mesh(new THREE.BoxGeometry(depth, height, width), material);
  piece.position.set(x, y, z);
  piece.castShadow = true;
  windowGroup.add(piece);
  return piece;
}

const centerY = sillHeight + windowSize / 2;
const frameWidth = 0.1;
// Quatro peças contornam o quadrado.
addWood(frameWidth, windowSize, 0.2, 3, centerY, windowStart + frameWidth / 2);
addWood(frameWidth, windowSize, 0.2, 3, centerY, windowEnd - frameWidth / 2);
addWood(windowSize, frameWidth, 0.2, 3, sillHeight + frameWidth / 2, windowZ);
addWood(windowSize, frameWidth, 0.2, 3, sillHeight + windowSize - frameWidth / 2, windowZ);

// Uma lâmina de vidro e duas travessas formam quatro painéis.
const pane = new THREE.Mesh(new THREE.PlaneGeometry(windowSize - 0.18, windowSize - 0.18), glass);
pane.rotation.y = Math.PI / 2;
pane.position.set(3, centerY, windowZ);
windowGroup.add(pane);
addWood(0.065, windowSize - 0.1, 0.22, 3, centerY, windowZ, darkWood);
addWood(windowSize - 0.1, 0.065, 0.22, 3, centerY, windowZ, darkWood);

// Peitoril saliente e puxador de metal.
addWood(windowSize + 0.2, 0.075, 0.35, 3.07, sillHeight - 0.02, windowZ, darkWood);
const handle = new THREE.Mesh(
  new THREE.SphereGeometry(0.045, 12, 8),
  new THREE.MeshStandardMaterial({ color: '#dfc07b', metalness: 0.75, roughness: 0.3 }),
);
handle.position.set(3.13, centerY - 0.12, windowZ + 0.13);
windowGroup.add(handle);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 400, false);
renderer.shadowMap.enabled = true;
document.querySelector('#scene').appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(1.5, 1.2, -0.4);
controls.enableDamping = true;
controls.update();

function showWindow(visible) {
  windowGroup.visible = visible;
  for (const [id, active] of [['opening', !visible], ['finished-window', visible]]) {
    const button = document.querySelector(`#${id}`);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}
document.querySelector('#opening').addEventListener('click', () => showWindow(false));
document.querySelector('#finished-window').addEventListener('click', () => showWindow(true));

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
