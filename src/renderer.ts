import dotenv from 'dotenv'
import { sync } from 'glob'
import { statSync, watchFile } from 'fs'
import matchParser from './matchParser'
import './index.css'

dotenv.config()

const PATH = `${process.env.USERPROFILE}/AppData/Local/Apps/2.0/Data/**/**/**/Data/AppFiles/**`

const syncMatches = () => console.log(matchParser(PATH), new Date())

const [recentFilters] = sync(`${PATH}/RecentFilters.xml`)
  .map(name => ({ name, ...statSync(name) }))
  .sort((a: any, b: any) => b.mtime - a.mtime)
  .map(({ name }) => name)

watchFile(recentFilters, syncMatches)
syncMatches()
