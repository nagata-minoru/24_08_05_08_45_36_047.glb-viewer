// テスト用に、三角形を 1 枚だけ持つ最小限の GLB (glTF 2.0 バイナリ) を組み立てる

const GLB_MAGIC = 0x46546c67; // 'glTF'
const CHUNK_JSON = 0x4e4f534a; // 'JSON'
const CHUNK_BIN = 0x004e4942; // 'BIN\0'

const padTo4 = (length: number) => (length + 3) & ~3;

export const createTriangleGLB = (): ArrayBuffer => {
  // カメラ (z = 5) から見て正面を向いた、原点を含む三角形
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);

  const bin = new Uint8Array(positions.byteLength + normals.byteLength);
  bin.set(new Uint8Array(positions.buffer), 0);
  bin.set(new Uint8Array(normals.buffer), positions.byteLength);

  const json = {
    asset: { version: '2.0' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'Triangle' }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, material: 0 }] }],
    // 既定の metallicFactor (1) だと環境マップのないシーンでは真っ黒になるので、非金属にする
    materials: [{ pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0 } }],
    buffers: [{ byteLength: bin.byteLength }],
    bufferViews: [{
      buffer: 0, byteOffset: 0, byteLength: positions.byteLength,
    }, {
      buffer: 0, byteOffset: positions.byteLength, byteLength: normals.byteLength,
    }],
    accessors: [{
      bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1, -1, 0], max: [1, 1, 0],
    }, {
      bufferView: 1, componentType: 5126, count: 3, type: 'VEC3',
    }],
  };

  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonLength = padTo4(jsonBytes.byteLength);
  const binLength = padTo4(bin.byteLength);
  const totalLength = 12 + 8 + jsonLength + 8 + binLength;

  const glb = new ArrayBuffer(totalLength);
  const view = new DataView(glb);
  const bytes = new Uint8Array(glb);

  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);

  view.setUint32(12, jsonLength, true);
  view.setUint32(16, CHUNK_JSON, true);
  bytes.fill(0x20, 20, 20 + jsonLength); // JSON チャンクは空白で埋める
  bytes.set(jsonBytes, 20);

  const binStart = 20 + jsonLength;
  view.setUint32(binStart, binLength, true);
  view.setUint32(binStart + 4, CHUNK_BIN, true);
  bytes.set(bin, binStart + 8);

  return glb;
};
