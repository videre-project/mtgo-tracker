export const toArrayBuffer = buffer => {
  const data = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(data);

  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }

  return data;
};
