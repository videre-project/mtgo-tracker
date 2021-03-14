// eslint-disable-next-line no-unused-vars
import { createWorker, PSM, ImageLike } from 'tesseract.js';
import { requireAtRuntime } from 'utils/electron';

const { join } = requireAtRuntime('path');

/**
 * Evaluates an image context, returning multi-line text
 * @param {ImageLike} image Image context to evaluate and decode
 */
export const evaluateImage = async image => {
  const worker = createWorker({ langPath: join(__dirname, '../../public') });

  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });

  const { data } = await worker.recognize(image);
  const { text } = data;

  await worker.terminate();

  return text;
};
