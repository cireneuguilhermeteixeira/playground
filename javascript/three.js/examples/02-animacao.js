import * as THREE from 'three';

const scene = new THREE.Scene();
scene.background = new THREE.Color('#203b45');

const camera = new THREE.PerspectiveCamera(60, 8 / 5, 0.1, 100);
camera.position.set(2, 2, 4);
camera.lookAt(0, 0, 0);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: '#eea36b' }),
);
scene.add(cube);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 400, false);
document.querySelector('#scene').appendChild(renderer.domElement);

// Novo: o loop roda continuamente. O tempo evita depender da taxa de quadros.
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const seconds = clock.getElapsedTime();
  cube.rotation.x = seconds * 0.4;
  cube.rotation.y = seconds * 0.7;
  renderer.render(scene, camera);
});
