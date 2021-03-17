const express = require('express');
const request = require('supertest');

const fetch = module =>
  request(
    express()
      .use(express.json({ limit: '1mb' }))
      .post('/', module)
  ).post('/');

module.exports = { fetch };
