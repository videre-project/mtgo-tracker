import ocrad from 'ocrad.js';

/**
 * Loads and evaluates an image by src
 * @param {String | Buffer} src Target image src
 * @returns {String} Parsed text output
 */
export const evaluateImage = src => {
  const image = document.createElement('img');
  image.src = src;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const text = ocrad(canvas);

  return text;
};
