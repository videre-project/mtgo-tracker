const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const loadTesseract = require('tesseract.js-core');
const { readFileSync } = require('fs');
const { toBuffer, toInt32 } = require('./utils');

const LOCALE = 'eng';

const { window } = new JSDOM('');
const { sanitize } = createDOMPurify(window);

module.exports = async (req, res) => {
  try {
    // Sanitize input
    const image = sanitize(req.body.image);

    // Validate OCR request
    if (!image) {
      return res.status(400).json({ error: 'Image not specified' });
    } else if (!Buffer.isBuffer(image) && !/data:image\/png;base64,([^"]*)/.test(image)) {
      return res.status(400).json({ error: 'Image must be a Buffer or base64url PNG' });
    }

    // Parse image data
    const data = new Uint8Array(Buffer.isBuffer(image) ? image : toBuffer(image));
    const width = toInt32(data.slice(16, 20));
    const height = toInt32(data.slice(20, 24));

    loadTesseract().then(tesseract => {
      // Init API
      const api = new tesseract.TessBaseAPI();

      // Set temp data
      const buffer = readFileSync(`${LOCALE}.traineddata`);
      const size = tesseract._malloc(data.length * Uint8Array.BYTES_PER_ELEMENT);
      tesseract.FS.writeFile(`${LOCALE}.traineddata`, buffer);
      tesseract.HEAPU8.set(data, size);

      // Set job
      api.Init(null, LOCALE);
      api.SetImage(size, width, height, Uint8Array.BYTES_PER_ELEMENT, width);
      api.SetRectangle(0, 0, width, height);

      // Extract text
      const text = api.GetUTF8Text();

      // Cleanup
      api.End();
      tesseract.destroy(api);
      tesseract._free(size);

      return res.status(200).json(text);
    });
  } catch (error) {
    console.error('Rejected', error);
    return res.status(500).json({ error: 'Image rejected' });
  }
};
