import { expect, test } from '@playwright/test';
import { createTriangleGLB } from '../fixtures/glb';

// 次のフレームで、canvas の中央のピクセル (RGBA) を読む
const readCenterPixel = (canvas: HTMLCanvasElement) => {
  return new Promise<number[]>((resolve) => {
    requestAnimationFrame(() => {
      const copy = document.createElement('canvas');
      copy.width = canvas.width;
      copy.height = canvas.height;
      const ctx = copy.getContext('2d')!;
      ctx.drawImage(canvas, 0, 0);
      resolve(Array.from(ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data));
    });
  });
};

test('ページを開くとファイル選択欄と表示領域がある', async ({ page }) => {
  await page.goto('');
  await expect(page).toHaveTitle('GLBファイル表示アプリ');
  await expect(page.locator('#fileInput')).toHaveAttribute('accept', '.glb');
  await expect(page.locator('#container canvas')).toHaveCount(0);
});

test('GLB ファイルを選ぶとモデルが描画される', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('');
  await page.locator('#fileInput').setInputFiles({
    name: 'triangle.glb',
    mimeType: 'model/gltf-binary',
    buffer: Buffer.from(createTriangleGLB()),
  });

  const canvas = page.locator('#container canvas');
  await expect(canvas).toHaveCount(1);
  const { clientWidth, clientHeight } = await page.locator('#container').evaluate((el) => ({
    clientWidth: el.clientWidth, clientHeight: el.clientHeight,
  }));
  await expect(canvas).toHaveJSProperty('width', clientWidth);
  await expect(canvas).toHaveJSProperty('height', clientHeight);

  // 背景は黒なので、中央の三角形が描かれていれば黒以外になる
  await expect.poll(async () => {
    const [r, g, b] = await canvas.evaluate(readCenterPixel);
    return r + g + b;
  }).toBeGreaterThan(0);

  expect(errors).toEqual([]);
});
