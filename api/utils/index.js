const ocr = require('./ocr');
const test = require('./test');

module.exports = {
  ...ocr,
  ...test,
};
