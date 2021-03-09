const { sync } = require('glob');
const { join } = require('path');
const { statSync } = require('fs');
const getMatchData = require('./getMatchData');
const verifyMatchData = require('./verifyMatchData');

/**
 * Parses and verifies match data by MTGO path
 * @param {string} dir Directory to scan for match data
 */
function parser(dir) {
  try {
    // Read and filter match logs by recency
    const mtgoLogs = sync(join(dir, 'Match_GameLog_**.dat'))
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.birthtime - a.birthtime);

    // Select active RecentFilters.xml
    const [recentFilters] = sync(join(dir, 'RecentFilters.xml'))
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.mtime - a.mtime)
      .map(({ name }) => name);
    if (!mtgoLogs || !recentFilters) throw new Error('No logs found.');

    // Parse and verify match data
    const matchData = mtgoLogs.map(file => getMatchData(file));
    const matches = verifyMatchData(matchData, recentFilters);

    return matches;
  } catch (error) {
    console.error('An error occured while parsing matches', error);
  }
}

module.exports = parser;
