import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#203b45');
const camera = new THREE.PerspectiveCamera(50, 8 / 5, 0.1, 100);
camera.position.set(7, 7, 8);

scene.add(new THREE.AmbientLight('#ffffff', 1.5));
const light = new THREE.DirectionalLight('#ffffff', 2);
light.position.set(-4, 8, 6);
scene.add(light);

const floor = new THREE.Mesh(
  new THREE.BoxGeometry(6, 0.12, 4),
  new THREE.MeshStandardMaterial({ color: '#8cb4b2' }),
);
scene.add(floor);

// Planta 2D em metros: [x, y]. Um vão entre segmentos deixa espaço para a porta.
const walls = [
  [[-3, -2], [-0.5, -2]], [[0.5, -2], [3, -2]],
  [[3, -2], [3, 2]], [[3, 2], [-3, 2]], [[-3, 2], [-3, -2]],
  [[0, -2], [0, 0.2]], [[0, 1.2], [0, 2]],
];
const height = 2;
const material = new THREE.MeshStandardMaterial({ color: '#e8e4d6' });

for (const [a, b] of walls) {
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const wall = new THREE.Mesh(new THREE.BoxGeometry(length, height, 0.12), material);
  wall.position.set((a[0] + b[0]) / 2, height / 2, (a[1] + b[1]) / 2);
  wall.rotation.y = -angle;
  scene.add(wall);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 400, false);
document.querySelector('#scene').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.8, 0);
controls.enableDamping = true;
controls.update();

const perspectivePosition = new THREE.Vector3(7, 7, 8);
function setView(isTop) {
  camera.position.copy(isTop ? new THREE.Vector3(0, 11, 0.001) : perspectivePosition);
  controls.target.set(0, isTop ? 0 : 0.8, 0);
  controls.enableRotate = !isTop;
  controls.update();
  for (const [id, active] of [['perspective', !isTop], ['top', isTop]]) {
    const button = document.querySelector(`#${id}`);
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}
document.querySelector('#perspective').addEventListener('click', () => setView(false));
document.querySelector('#top').addEventListener('click', () => setView(true));
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });
