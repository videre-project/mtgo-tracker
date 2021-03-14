import { join } from 'path';
import { evaluateImage } from 'worker';

describe('ocr', () => {
  it('Reads an image', async () => {
    const text = await evaluateImage(join(__dirname, 'data/ocr-test.png'));

    expect(text.trim()).toMatch(/test/i);
  });
});
