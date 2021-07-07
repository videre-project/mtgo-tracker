import loadTesseract from 'tesseract.js-core';
import { requireAtRuntime } from 'utils/electron';

const { readFileSync } = requireAtRuntime('fs');
const { join } = requireAtRuntime('path');

const LOCALE = 'eng';

export const evaluateImage = image => {
  // Validate OCR request
  if (!image) {
    throw new Error('Image not specified');
  } else if (!(image instanceof ArrayBuffer)) {
    throw new Error('Image must be a typed array');
  }

  // Parse image data
  const data = new DataView(image);
  const width = data.getInt32(0);
  const height = data.getInt32(4);

  // Run job
  return new Promise(resolve => {
    loadTesseract().then(tesseract => {
      // Init API
      const api = new tesseract.TessBaseAPI();

      // Set temp data
      const buffer = readFileSync(join('data', `${LOCALE}.traineddata`));
      const size = tesseract._malloc(image.length * Uint8Array.BYTES_PER_ELEMENT);
      tesseract.FS.writeFile(`${LOCALE}.traineddata`, buffer);
      tesseract.HEAPU8.set(image, size);

      // Set job
      api.Init(null, LOCALE);
      api.SetImage(size, width, height, Uint8Array.BYTES_PER_ELEMENT, width);
      api.SetRectangle(0, 0, width, height);

      // Extract text
      const text = api.GetUTF8Text();

      // Cleanup
      api.End();
      tesseract.destroy(api);
      tesseract._free(size);

      // End job
      resolve(text);
    });
  });
};
