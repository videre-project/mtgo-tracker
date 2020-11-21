import mtgoTracker from '../mtgoTracker'
import { resolve } from 'path'
import combinedResult from './data/combinedResult.json'

describe('mtgoTracker', () => {
  it('Gets combined match score.', () => {
    const result = mtgoTracker(resolve(__dirname, '../../matches'))

    expect(result).toStrictEqual(combinedResult)
  })
})
