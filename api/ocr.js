const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const loadTesseract = require('tesseract.js-core');
const { readFileSync } = require('fs');
const { normalize } = require('path');

const LOCALES = ['eng', 'fas', 'mri', 'slk_frak'];

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const Int32 = bytes => (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];

module.exports = async (req, res) => {
  try {
    // Sanitize input
    const image = DOMPurify.sanitize(req.body.image);
    const locale = DOMPurify.sanitize(req.body.locale).toLowerCase() || 'eng';

    // Validate OCR request
    if (!image) {
      return res.status(400).json({ error: 'Image not specified' });
    } else if (!/data:image\/([a-zA-Z]*);base64,([^\\"]*)/.test(image)) {
      return res.status(400).json({ error: 'Image must be base64 PNG' });
    } else if (!LOCALES.includes(locale)) {
      return res.status(400).json({ error: 'Locale not supported' });
    }

    // Parse image data
    const data = Buffer.from(image, 'base64');
    const width = Int32(image.slice(16, 20));
    const height = Int32(image.slice(20, 24));

    // Load WASM module
    const tesseract = await loadTesseract();

    // Init API
    const api = new tesseract.TessBaseAPI();

    // Parse training and input data
    const buffer = readFileSync(normalize(`./data/${locale}.traineddata`));
    const picture = tesseract._malloc(data.length * Uint8Array.BYTES_PER_ELEMENT);

    // Set temp data
    tesseract.FS.writeFile(`${locale}.traineddata`, buffer);
    tesseract.HEAPU8.set(data, picture);

    // Set job
    api.Init(null, locale);
    api.SetImage(picture, width, height, Uint8Array.BYTES_PER_ELEMENT, width);
    api.SetRectangle(0, 0, width, height);

    // Extract text
    const text = api.GetUTF8Text();

    // Cleanup
    api.End();
    tesseract.destroy(api);
    tesseract._free(picture);

    return res.status(200).json(text);
  } catch (error) {
    console.error('Rejected', error);
    return res.status(500).json({ error: 'Image rejected' });
  }
};
