import mtgoTracker from '../mtgoTracker'
import { resolve } from 'path'

describe('mtgoTracker', () => {
  it('Gets most recent match score.', () => {
    const result = mtgoTracker(resolve(__dirname, '../../matches'))

    expect(result).toStrictEqual([{
      id: 'cd9cc466-0607-45f3-b7e2-d9dfd4d83bb3',
      player1: 'AceCTR',
      player2: 'Therovingpunster',
      record: '2-1-0'
    }])
  })
})
