import dotenv from 'dotenv'
import { sync } from 'glob'
import { statSync, watchFile } from 'fs'
import matchParser from './matchParser'
import { useLocalStorage } from './utils'
import './index.css'

dotenv.config()

const PATH = `${process.env.USERPROFILE}/AppData/Local/Apps/2.0/Data/**/**/**/Data/AppFiles/**`

const [matches, setMatches] = useLocalStorage('matches')

const syncMatches = () => {
  const newMatches = matchParser(PATH)

  setMatches(newMatches)

  console.log(matches())
}

const [recentFilters] = sync(`${PATH}/RecentFilters.xml`)
  .map(name => ({ name, ...statSync(name) }))
  .sort((a: any, b: any) => b.mtime - a.mtime)
  .map(({ name }) => name)

watchFile(recentFilters, syncMatches)
syncMatches()
