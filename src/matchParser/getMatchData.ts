import { readFileSync } from 'fs'

function getMatchData({ name, ctime, mtime }: any) {
  try {
    const data = readFileSync(name, { encoding: 'utf8' })

    // Remove utf8 errors and create an array of game actions
    const output = JSON.stringify(data)
      .replace(/[^\040-\176\200-\377]/gi, '') // Remove utf8 errors.
      .split('@P')
      .map(s => {
        const hasHintText = s.includes('.).')
        const string = s.substring(0, hasHintText ? s.indexOf('.).') : s.indexOf('.'))

        return hasHintText ? `${string}.)` : string
      })
      .filter(Boolean)

    // Filter seen players
    const usernames = [...new Set(output
      .filter(s => s.includes('joined the game'))
      .map(s => s.replace(' joined the game', '')))]
    if (usernames.length !== 2) throw new Error('Couldn\'t find players.')

    // Enumerate seen cards per player
    const decks = usernames.map((username: string) => {
      const cards = output
        .filter(s =>
          s.includes(`${username} plays `) ||
          s.includes(`${username} casts `) ||
          s.includes(`${username} reveals `) ||
          s.includes(`${username} discards `) ||
          s.includes(`${username} exiles `)
        )
        .map(s => s.split('@[')[1].split('@')[0])

      return cards.filter((c, i) => cards.indexOf(c) === i)
    })

    // Calculate concessions
    const concessions = output
      .filter(s => /(has conceded|has lost)/.test(s))
      .map(line => line
        .replace(' has conceded from the game', '')
        .replace(' has lost the game', '')
      )
    if (concessions.length < 2) {
      concessions.concat(output
        .filter(s => /has left/.test(s))
        .map(line => line.replace(' has left the game', ''))[0]
      )
    }

    if (concessions.length < 2) throw new Error('Couldn\'t find record.')

    // Parse match id
    const id = name.split('Match_GameLog_')[1].replace('.dat', '')

    // Calculate match start time
    const date = new Date(ctime).getTime()

    // Calculate match duration
    const duration = Math.abs(new Date(mtime).getTime() - date)

    // Bind match data to players
    const players = usernames.map((username, index) => {
      const deck = decks[index]
      const wins = concessions.filter(u => u !== username).length
      const losses = concessions.filter(u => u === username).length
      const record = `${wins}-${losses}`
      const games = concessions.map(u => u === username ? 'L' : 'W')

      return {
        username,
        deck,
        record,
        games,
      }
    })

    // Clean log to make human-readable
    const log = output.map(s => {
      if (s.includes('\\')) return s.split('\\')[0]
      if (!s.includes('@[')) return s

      const fragments = s.split('@[').map(f => f
        .replace('@]', '@')
        .split('@')
        .filter(f => !f.includes(':'))
        .join('')
      )

      return `${fragments.join('')}.`
    }).join('\n')

    return {
      id,
      date,
      duration,
      players,
      log,
    }
  } catch (error) {
    console.error(`An error occured while parsing matchlog: ${error.message}`)
  }
}

export default getMatchData
