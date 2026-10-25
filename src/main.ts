import { displayGLB, readFileAsArrayBuffer } from './viewer';

document.getElementById('fileInput')!.addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files![0];
  if (file) {
    const contents = await readFileAsArrayBuffer(file);
    await displayGLB(document.getElementById('container')!, contents);
  }
});
