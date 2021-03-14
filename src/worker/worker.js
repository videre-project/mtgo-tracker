import { parseMatch, validateMatch } from './parser';
import { evaluateImage } from './ocr';

onmessage = async ({ data }) => {
  const { type, ...rest } = data;

  switch (type) {
    case 'match': {
      const { filePath, index } = rest;

      // Parse and verify match data
      const matchData = await parseMatch(filePath);
      const match = await validateMatch(matchData, index);

      return postMessage(match);
    }
    case 'ocr': {
      const { image } = rest;

      // Parse and evaluate image
      const text = await evaluateImage(image);

      return postMessage(text);
    }
    default:
      throw new Error();
  }
};
