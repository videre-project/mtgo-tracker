import { statSync } from 'fs'
import { sync } from 'glob'
import getMatchData from './getMatchData'
import combineMatchData from './combineMatchData'

function matchParser(path: string) {
  const matchLogs = sync(`${path}/Match_GameLog_**.dat`)
    .map(name => ({ name, ...statSync(name) }))
    .sort((a: any, b: any) => b.birthtime - a.birthtime)

  const matchData = matchLogs?.map(file => getMatchData(file)).filter(Boolean)

  const matches = combineMatchData(matchData, `${path}/RecentFilters.xml`).filter(Boolean)

  return matches
}

export default matchParser
