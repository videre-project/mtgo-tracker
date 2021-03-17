const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const loadTesseract = require('tesseract.js-core');
const { readFileSync } = require('fs');
const { normalize } = require('path');

const LOCALES = ['eng', 'fas', 'mri', 'slk_frak'];

const { window } = new JSDOM('');
const { sanitize } = createDOMPurify(window);

const toBuffer = base64 =>
  Buffer.from(base64.startsWith('data') ? base64.split(',')[1] : base64, 'base64');

const toInt32 = bytes => (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];

module.exports = async (req, res) => {
  try {
    // Sanitize input
    const image = sanitize(req.body.image);
    const locale = sanitize(req.body.locale).toLowerCase() || 'eng';

    // Validate OCR request
    if (!image) {
      return res.status(400).json({ error: 'Image not specified' });
    } else if (
      typeof image !== 'string' &&
      !Buffer.isBuffer(image) &&
      !/^(data:image\/png;base64,)?(?:[\w+/]{4})*(?:[\w+/]{2}==|[\w+/]{3}=)?$/.test(image)
    ) {
      return res
        .status(400)
        .json({ error: 'Image must be a Buffer or base64/base64url PNG' });
    } else if (!LOCALES.includes(locale)) {
      return res.status(400).json({ error: 'Locale not supported' });
    }

    // Parse image data
    const data = new Uint8Array(Buffer.isBuffer(image) ? image : toBuffer(image));
    const width = toInt32(data.slice(16, 20));
    const height = toInt32(data.slice(20, 24));

    loadTesseract().then(tesseract => {
      // Init API
      const api = new tesseract.TessBaseAPI();

      // Set temp data
      const buffer = readFileSync(normalize(`./data/${locale}.traineddata`));
      const size = tesseract._malloc(data.length * Uint8Array.BYTES_PER_ELEMENT);
      tesseract.FS.writeFile(`${locale}.traineddata`, buffer);
      tesseract.HEAPU8.set(data, size);

      // Set job
      api.Init(null, locale);
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
