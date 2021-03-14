// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./worker.js';

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

      callback(data);
    };

    worker.postMessage({ type: 'match', ...file });
  });
};

/**
 * Dispatches a worker to parse and evaluate an image
 * @param {String} src An image file location to parse
 * @param {Function} callback A callback to execute after evaluation
 */
export const evaluateImage = (src, callback) => {
  const worker = new Worker();

  worker.onmessage = ({ data }) => {
    worker.terminate();

    callback(data);
  };

  worker.postMessage({ type: 'ocr', src });
};
