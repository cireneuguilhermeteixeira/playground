import * as THREE from 'three';

// 1. Cena: onde os objetos vivem.
const scene = new THREE.Scene();
scene.background = new THREE.Color('#203b45');

// 2. Câmera: posição e direção do olhar.
const camera = new THREE.PerspectiveCamera(60, 8 / 5, 0.1, 100);
camera.position.set(2, 2, 4);
camera.lookAt(0, 0, 0);

// 3. Objeto: geometria (forma) + material (aparência).
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: '#eea36b' });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);


// 4. Renderizador: desenha um quadro no elemento HTML.
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(640, 400, false);
document.querySelector('#scene').appendChild(renderer.domElement);
renderer.render(scene, camera);
