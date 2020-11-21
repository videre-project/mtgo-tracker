import parser from '.';
import { resolve } from 'path';
import combinedResult from '../data/combinedResult.json';

describe('mtgoTracker', () => {
  it('Gets combined match score.', () => {
    const result = parser(resolve(__dirname, '../data'));

    expect(result).toStrictEqual(combinedResult);
  });
});
