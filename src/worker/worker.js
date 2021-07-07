import { parseMatch, validateMatch } from './parser';

onmessage = async ({ data }) => {
  const { filePath, index } = data;

  // Parse and verify match data
  const matchData = await parseMatch(filePath);
  const match = await validateMatch(matchData, index);

  return postMessage(match);
};
