const { readFileSync } = require('fs');
const { join } = require('path');
const { fetch, toBase64URL, toBuffer } = require('../utils');

const ocr = require('../ocr');

describe('/ocr', () => {
  const data = readFileSync(join(__dirname, 'data/title_bar.png'), 'base64');

  it('Reads a base64 image', async () => {
    const response = await fetch(ocr).send({ image: data });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });

  it('Reads a base64url image', async () => {
    const image = toBase64URL(data);

    const response = await fetch(ocr).send({ image });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });

  it('Reads a buffered image', async () => {
    const image = toBuffer(data);
    const response = await fetch(ocr).send({ image });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });
});
