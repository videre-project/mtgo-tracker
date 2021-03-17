const express = require('express');
const request = require('supertest');
const { readFileSync } = require('fs');
const { join } = require('path');

describe('/ocr', () => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.post('/', require('../ocr'));

  it('Reads an base64 image', async () => {
    const image = readFileSync(join(__dirname, 'data/title_bar.png'), 'base64');

    const response = await request(app).post('/').send({ image });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });

  it('Reads an base64url image', async () => {
    const data = readFileSync(join(__dirname, 'data/title_bar.png'), 'base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/\\=+$/, '');

    const image = `data:image/png;base64,${data}`;

    const response = await request(app).post('/').send({ image });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });

  it('Reads a buffered image', async () => {
    const image = readFileSync(join(__dirname, 'data/title_bar.png'));

    const response = await request(app).post('/').send({ image });

    expect(response.status).toBe(200);
    expect(response.body).toMatch(/^Modern Showcase Challenge: Vs\. Parole/i);
    expect(response.body).toMatch(/Event # 122669131 - Match # 237751908$/i);
  });
});
