import * as THREE from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DRACO_DECODER_PATH,
  Renderer,
  createCamera,
  createLoader,
  createScene,
  displayGLB,
  parseGLB,
  readFileAsArrayBuffer,
} from '../../src/viewer';
import { createTriangleGLB } from '../fixtures/glb';

describe('readFileAsArrayBuffer', () => {
  it('ファイルの中身を ArrayBuffer として読み込む', async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3, 4])]);
    const result = await readFileAsArrayBuffer(blob);
    expect(Array.from(new Uint8Array(result))).toEqual([1, 2, 3, 4]);
  });
});

describe('createScene', () => {
  it('環境光と平行光源を追加する', () => {
    const scene = createScene();

    const ambient = scene.children.find((c): c is THREE.AmbientLight => c instanceof THREE.AmbientLight);
    expect(ambient?.intensity).toBe(0.5);

    const directional = scene.children.find((c): c is THREE.DirectionalLight => c instanceof THREE.DirectionalLight);
    expect(directional?.intensity).toBe(1);
    expect(directional?.position.toArray()).toEqual([0, 1, 0]);
  });
});

describe('createCamera', () => {
  it('表示領域のアスペクト比で z = 5 に置く', () => {
    const camera = createCamera(800, 600);
    expect(camera.fov).toBe(75);
    expect(camera.aspect).toBeCloseTo(800 / 600);
    expect(camera.near).toBe(0.1);
    expect(camera.far).toBe(1000);
    expect(camera.position.toArray()).toEqual([0, 0, 5]);
  });
});

describe('createLoader', () => {
  it('Draco デコーダーのパスを設定する', () => {
    // デコーダーのパスの持ち方は three の版で変わるので、公開 API の呼び出しで確かめる
    const setDecoderPath = vi.spyOn(DRACOLoader.prototype, 'setDecoderPath');
    const loader = createLoader();
    expect(loader.dracoLoader).toBeInstanceOf(DRACOLoader);
    expect(setDecoderPath).toHaveBeenCalledWith(DRACO_DECODER_PATH);
    setDecoderPath.mockRestore();
  });
});

describe('parseGLB', () => {
  it('GLB を読み込んでメッシュを取り出す', async () => {
    const gltf = await parseGLB(createLoader(), createTriangleGLB());

    const meshes: THREE.Mesh[] = [];
    gltf.scene.traverse((o: THREE.Object3D) => {
      if (o instanceof THREE.Mesh) meshes.push(o);
    });
    expect(meshes).toHaveLength(1);
    expect(meshes[0].name).toBe('Triangle');
    expect(meshes[0].geometry.getAttribute('position').count).toBe(3);
  });

  it('GLB でないデータは reject する', async () => {
    const invalid = new TextEncoder().encode('not a glb').buffer as ArrayBuffer;
    await expect(parseGLB(createLoader(), invalid)).rejects.toThrow();
  });
});

describe('displayGLB', () => {
  let container: HTMLElement;
  let renderer: Renderer & { setSize: Mock<Renderer['setSize']>, render: Mock<Renderer['render']> };
  let requestAnimationFrame: Mock<(callback: FrameRequestCallback) => number>;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    document.body.appendChild(container);

    renderer = {
      domElement: document.createElement('canvas'),
      setSize: vi.fn<Renderer['setSize']>(),
      render: vi.fn<Renderer['render']>(),
    };
    requestAnimationFrame = vi.fn<(callback: FrameRequestCallback) => number>();
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame);
  });

  afterEach(() => {
    container.remove();
    vi.unstubAllGlobals();
  });

  it('レンダラーをコンテナの大きさに合わせて追加する', async () => {
    await displayGLB(container, createTriangleGLB(), () => renderer);
    expect(renderer.setSize).toHaveBeenCalledWith(800, 600);
    expect(container.contains(renderer.domElement)).toBe(true);
  });

  it('読み込んだモデルをシーンに追加して描画を始める', async () => {
    const { scene, camera, gltf } = await displayGLB(container, createTriangleGLB(), () => renderer);

    expect(scene.children).toContain(gltf.scene);
    expect(camera.aspect).toBeCloseTo(800 / 600);
    expect(renderer.render).toHaveBeenCalledTimes(1);
    expect(renderer.render).toHaveBeenCalledWith(scene, camera);
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    // 次のフレームでも描画が続く
    requestAnimationFrame.mock.calls[0][0](0);
    expect(renderer.render).toHaveBeenCalledTimes(2);
  });

  it('読み込みに失敗したら描画しない', async () => {
    const invalid = new TextEncoder().encode('not a glb').buffer as ArrayBuffer;
    await expect(displayGLB(container, invalid, () => renderer)).rejects.toThrow();
    expect(renderer.render).not.toHaveBeenCalled();
  });
});
