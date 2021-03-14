// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./worker.js';
// eslint-disable-next-line no-unused-vars
import { createWorker, PSM, ImageLike } from 'tesseract.js';

/**
 * Dispatches workers to fetch an array of matches, executing a callback for each match.
 * @param {Array.<{ filePath: String, index?: Number }>} files An array of file paths to process
 * @param {Function} callback A callback to execute after each match is processed
 */
export const fetchMatches = (files, callback) => {
  files.forEach(file => {
    const worker = new Worker();

    worker.onmessage = ({ data }) => {
      worker.terminate();

      if (callback && data) callback(data);
    };

    worker.postMessage(file);
  });
};

/**
 * Evaluates an image context, returning multi-line text
 * @param {ImageLike} image Image context to evaluate and decode
 */
export const evaluateImage = async image => {
  const worker = createWorker();

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
