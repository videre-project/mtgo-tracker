import { statSync } from 'fs'
import { sync } from 'glob'
import getMatchData from './getMatchData'
import combineMatchData from './combineMatchData'

function mtgoTracker(path: string) {
  const matchLogs = sync(`${path}/Match_GameLog_**.dat`)
    .map(name => ({ name, ...statSync(name) }))
    .sort((a: any, b: any) => b.birthtime - a.birthtime)

  const matchData = matchLogs?.map(file => getMatchData(file)).filter(Boolean)
  return matchData
  const matches = combineMatchData(matchData, `${path}/RecentFilters.xml`)

  return matches
}

export default mtgoTracker
