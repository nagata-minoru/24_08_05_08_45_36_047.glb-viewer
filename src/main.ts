import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

document.getElementById('fileInput')!.addEventListener('change', function (event) {
  const file = (event.target as HTMLInputElement).files![0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const contents = e.target!.result;
      displayGLB(contents as ArrayBuffer);
    };
    reader.readAsArrayBuffer(file);
  }
});

function displayGLB(contents: ArrayBuffer) {
  const container = document.getElementById('container')!;
  const width = container.clientWidth;
  const height = container.clientHeight;

  // シーンの作成
  const scene = new THREE.Scene();

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  // レンダラーの作成
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0).normalize();
  scene.add(directionalLight);

  // GLBローダーの作成
  const loader = new GLTFLoader();

  // Dracoローダーの設定
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  loader.setDRACOLoader(dracoLoader);

  loader.parse(contents, '', function (gltf) {
    scene.add(gltf.scene);
    animate();
  });

  // アニメーションループ
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
}
