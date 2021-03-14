const CAPTURE_WIDTH = 1280;
const CAPTURE_HEIGHT = 720;

/**
 * Waits for a video's metadata to load, returns an empty promise.
 * @param {HTMLVideoElement} video Video to wait for.
 */
export const waitForVideo = video =>
  new Promise(resolve => (video.onloadedmetadata = resolve));

/**
 * Reads from a window stream and returns a screenshot.
 * @param {String} windowName Target source name to capture.
 */
export const captureWindow = async windowName => {
  if (!window?.ocr) return;

  const sources = await window.ocr.getSources();
  const source = sources.find(source => source.name === windowName);
  if (!source) return;

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id,
        minWidth: CAPTURE_WIDTH,
        maxWidth: CAPTURE_WIDTH,
        minHeight: CAPTURE_HEIGHT,
        maxHeight: CAPTURE_HEIGHT,
      },
    },
  });

  const video = document.createElement('video');
  video.srcObject = stream;

  const canvas = document.createElement('canvas');
  canvas.width = CAPTURE_WIDTH;
  canvas.height = CAPTURE_HEIGHT;

  await waitForVideo(video);

  canvas.getContext('2d').drawImage(video, 0, 0);

  const image = canvas.toDataURL('image/png', 1);

  video.remove();
  canvas.remove();

  return image;
};
