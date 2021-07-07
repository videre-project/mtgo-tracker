import { readFileSync } from 'fs';
import { join } from 'path';
import { toArrayBuffer } from 'utils/ocr';
import { evaluateImage } from 'worker/ocr';

describe('ocr', () => {
  const data = readFileSync(join(__dirname, 'data', 'title_bar.png'));

  it('reads an image', async () => {
    const image = toArrayBuffer(data);
    const output = await evaluateImage(image);

    expect(output.trim()).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(output.trim()).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });
});
