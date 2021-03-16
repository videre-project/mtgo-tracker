const express = require('express');
const request = require('supertest');
const { readFileSync } = require('fs');
const { join } = require('path');

describe('/ocr', () => {
  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.post('/', require('../ocr'));

  const data = readFileSync(join(__dirname, 'test.png'), 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\\=+$/, '');

  const image = `data:image/png;base64,${data}`;

  it('Reads an image', async () => {
    const response = await request(app).post('/').send({ image });

    console.log(response.body);
    expect(response.status).toBe(200);
  });
});
