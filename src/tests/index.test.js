import matchParser from '../matchParser';
import { resolve } from 'path';
import combinedResult from './data/combinedResult.json';

describe('mtgoTracker', () => {
  it('Gets combined match score.', () => {
    const result = matchParser(resolve(__dirname, './matches'));

    expect(result).toStrictEqual(combinedResult);
  });
});
