import { readFileSync } from 'fs'
import dotenv from 'dotenv'

dotenv.config()

function getMatchData(fileName: any) {
  const data = readFileSync(fileName, { encoding: 'utf8' })

  const output = JSON.stringify(data)
    .replace(/[^\040-\176\200-\377]/gi, '')
  // Remove utf8 errors.
    .split('@P')
    .map(s => s.substring(0, s.indexOf('.')))
    .filter(Boolean)
  // Split and filter out instances of '@P' (when MTGO is referring to a player).

  // TODO: proper regex to identify and clean cardnames.

  const [player1, player2] = [...new Set(output
    .filter(s => s.includes('joined the game'))
    .map(s => s.replace(' joined the game', '')))]
  if (!player1 || !player2) return false

  const concessions = output
    .filter(s => s.includes('has conceded') || s.includes('has lost'))
    .map(line => line.replace(' has conceded from the game', '').replace(' has lost the game', ''))

  // TODO: handle losses due to inaction and players leaving the game.

  const id = fileName.split('Match_GameLog_')[1].replace('.dat', '')

  const wins = concessions.filter(l => l === player2).length
  const losses = concessions.filter(l => l === player1).length
  if (wins + losses < 3) return false

  const record = `${wins}-${losses}-0`

  // TODO: handle match ties due to MTGO timer; possible prompt from concession?

  return { id, player1, player2, record }
}

export default getMatchData
