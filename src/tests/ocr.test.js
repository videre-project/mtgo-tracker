import { readFileSync } from 'fs';
import { join } from 'path';
import { evaluateImage } from 'worker/ocr';

describe('ocr', () => {
  it('Reads an image', async () => {
    const src = readFileSync(join(__dirname, 'data/ocr-test.png'));
    const text = await evaluateImage(src);

    expect(text.trim()).toBe('Test');
  });
});
