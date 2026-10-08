import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#203b45');

const camera = new THREE.PerspectiveCamera(60, 8 / 5, 0.1, 100);
camera.position.set(2, 2, 4);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: '#eea36b', roughness: 0.65 }),
);
scene.add(cube);

// Novo: duas fontes de luz com papéis diferentes.
scene.add(new THREE.AmbientLight('#ffffff', 1.2));
const light = new THREE.DirectionalLight('#ffffff', 2);
light.position.set(3, 5, 4);
scene.add(light);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 400, false);
document.querySelector('#scene').appendChild(renderer.domElement);

// Novo: o usuário controla a câmera com mouse ou toque.
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
