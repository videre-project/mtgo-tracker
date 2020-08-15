import { statSync, readFileSync } from 'fs'
import { sync } from 'glob'
import dotenv from 'dotenv'

dotenv.config()

const DEFAULT_PATH = `${process.env.USERPROFILE}/Local Settings/Application Data/Apps/2.0/Data/**/**/**/Data/AppFiles/**`

function mtgoTracker(path = DEFAULT_PATH) {
  const fileName = sync(`${path}/Match_GameLog_**.dat`)
    .map(name => ({ name, ctime: statSync(name).ctime }))
    .sort((a: any, b: any) => b.ctime - a.ctime)[0].name

  const data = readFileSync(fileName, { encoding: 'utf8' })

  const output = JSON.stringify(data)
    .replace(/[^\040-\176\200-\377]/gi, '')
    .split('@P')
    .map(s => s.substring(0, s.indexOf('.')))
    .filter(Boolean)

  const [player1, player2] = [...new Set(output
    .filter(s => s.includes('joined the game'))
    .map(s => s.replace(' joined the game', '')))]

  const concessions = output
    .filter(s => s.includes('has conceded') || s.includes('has lost'))
    .map(line => line.replace(' has conceded from the game', '').replace(' has lost the game', ''))

  const id = fileName.split('Match_GameLog_')[1].replace('.dat', '')

  const wins = concessions.filter(l => l === player2).length
  const losses = concessions.filter(l => l === player1).length
  const record = `${wins}-${losses}-0`

  return { id, player1, player2, record }
}

export default mtgoTracker
