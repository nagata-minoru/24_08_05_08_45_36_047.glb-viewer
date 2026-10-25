import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/v1/decoders/';

// 描画に使うレンダラーの最小限のインターフェース（テストで差し替えられるようにする）
export type Renderer = Pick<THREE.WebGLRenderer, 'domElement' | 'setSize' | 'render'>;

export const readFileAsArrayBuffer = (file: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target!.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export const createScene = () => {
  const scene = new THREE.Scene();

  // ライトの追加
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 0).normalize();
  scene.add(directionalLight);

  return scene;
};

export const createCamera = (width: number, height: number) => {
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;
  return camera;
};

export const createLoader = () => {
  const loader = new GLTFLoader();

  // Dracoローダーの設定
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(DRACO_DECODER_PATH);
  loader.setDRACOLoader(dracoLoader);

  return loader;
};

export const parseGLB = (loader: GLTFLoader, contents: ArrayBuffer): Promise<GLTF> => {
  return new Promise((resolve, reject) => {
    loader.parse(contents, '', resolve, reject);
  });
};

export const displayGLB = async (
  container: HTMLElement,
  contents: ArrayBuffer,
  createRenderer: () => Renderer = () => new THREE.WebGLRenderer(),
) => {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const scene = createScene();
  const camera = createCamera(width, height);

  // レンダラーの作成
  const renderer = createRenderer();
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const gltf = await parseGLB(createLoader(), contents);
  scene.add(gltf.scene);

  // アニメーションループ
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  return { scene, camera, renderer, gltf };
};
