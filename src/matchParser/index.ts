import { sync } from 'glob'
import { statSync } from 'fs'
import getMatchData from './getMatchData'
import verifyMatchData from './verifyMatchData'

function matchParser(path: string) {
  try {
    const mtgoLogs = sync(`${path}/Match_GameLog_**.dat`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a: any, b: any) => b.birthtime - a.birthtime)
      .filter(
        ({ ctime, mtime }) =>
          Math.abs(new Date(mtime).getTime() - new Date(ctime).getTime()) > 0
      )

    const [recentFilters] = sync(`${path}/RecentFilters.xml`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a: any, b: any) => b.mtime - a.mtime)
      .map(({ name }) => name)
    if (!mtgoLogs || !recentFilters) throw new Error('No logs found.')

    const matchData = mtgoLogs.map(file => getMatchData(file)).filter(Boolean)

    const matches = verifyMatchData(matchData, recentFilters).filter(Boolean)

    return matches
  } catch (error) {
    console.error(`An error occured while parsing matches: ${error.stack}`)
  }
}

export default matchParser
