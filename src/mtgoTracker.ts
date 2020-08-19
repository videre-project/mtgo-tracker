import { statSync } from 'fs'
import { sync } from 'glob'
import dotenv from 'dotenv'
import getMatchData from './getMatchData'

dotenv.config()

const DEFAULT_PATH = `${process.env.USERPROFILE}/Local Settings/Application Data/Apps/2.0/Data/**/**/**/Data/AppFiles/**`
// Declare DEFAULT_PATH as default MTGO files path; v4 automatically uses this location.

function mtgoTracker(path = DEFAULT_PATH) {
  const files = sync(`${path}/Match_GameLog_**-**.dat`)
    .map(name => ({ name, ctime: statSync(name).ctime }))
    .sort((a: any, b: any) => b.ctime - a.ctime)
    // Find match gamelog files with a valid ID containing '-'.
    // Replay gamelog ids use the GameID (numerical only), which are invalid matches for scanning.

  const matches = files?.map(({ name }) => getMatchData(name)).filter(Boolean)

  return matches
}

export default mtgoTracker
