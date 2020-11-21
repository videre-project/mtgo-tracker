import dotenv from 'dotenv'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import matchParser from './matchParser'
import './index.css'

dotenv.config()

const INPUT_PATH = `${process.env.USERPROFILE}/Local Settings/Application Data/Apps/2.0/Data/**/**/**/Data/AppFiles/**`
const APPLICATION_PATH = `${process.env.USERPROFILE}/AppData/Roaming/mtgo-tracker`
const OUTPUT_PATH = `${APPLICATION_PATH}/matches`

const matches = matchParser(INPUT_PATH)
console.log(matches)

if (!existsSync(APPLICATION_PATH)) mkdirSync(APPLICATION_PATH)
if (!existsSync(OUTPUT_PATH)) mkdirSync(OUTPUT_PATH)

matches.forEach(match => {
  writeFileSync(`${OUTPUT_PATH}/${match.id}.json`, JSON.stringify(match))
})
