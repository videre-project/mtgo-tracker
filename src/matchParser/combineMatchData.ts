import { readFileSync } from 'fs'

function combineMatchData(matchLogs: any, fileName: any) {
  try {
    const xml = readFileSync(fileName, { encoding: 'utf8' })

    const xmlDoc = new DOMParser().parseFromString(xml, 'application/xml')

    const parse = (parent: Element, selector: string) => {
      const element = parent.querySelector(`${selector} *[IsSet=true] Value`)

      return element ? element.textContent : null
    }

    const matches = Array.from(xmlDoc.getElementsByTagName('PersistedFilter'))
      .map((match, index) => {
        const gameData = matchLogs[index]
        if (!gameData) return null

        const {
          Comments,
          OrganizationLevel,
          TournamentInitiationType,
        } = match.attributes as any

        const name = Comments.value
        const level = OrganizationLevel.value
        const status = TournamentInitiationType.value

        const format = parse(match, 'PlayFormat')
        const formatType = parse(match, 'DeckCreationStyle')
        const tournamentType = parse(match, 'TournamentStructureValue')

        return {
          name,
          level,
          status,
          format,
          formatType,
          tournamentType,
          ...gameData,
        }
      })
      .filter(Boolean)
      .filter(({ id }) => id.includes('-'))

    return matches
  } catch (error) {
    console.log(`An error occured while parsing match data: ${error.stack}`)
  }
}

export default combineMatchData
