const toBase64URL = base64 =>
  `data:image/png;base64,${base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\\=+$/, '')}`;

const toBuffer = base64 =>
  Buffer.from(base64.startsWith('data') ? base64.split(',')[1] : base64, 'base64');

const toUint8Array = data =>
  new Uint8Array(Buffer.isBuffer(data) ? data : toBuffer(data));

const toInt32 = bytes => (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];

module.exports = {
  toBase64URL,
  toBuffer,
  toUint8Array,
  toInt32,
};
