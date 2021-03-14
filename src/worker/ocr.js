import ocrad from 'ocrad.js';
import { Image, createCanvas as Canvas } from 'canvas';

/**
 * Loads and evaluates an image by src
 * @param {String | Buffer} src Target image src
 */
export const evaluateImage = src => {
  const image = new Image();
  image.src = src;

  const canvas = new Canvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, image.width, image.height);

  const text = ocrad(canvas);

  return text;
};
