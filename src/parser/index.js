const { sync } = require('glob');
const { statSync } = require('fs');
const getMatchData = require('./getMatchData');
const verifyMatchData = require('./verifyMatchData');

/**
 * Parses and verifies match data by MTGO path
 */
function parser(path) {
  try {
    // Read and filter match logs by recency
    const mtgoLogs = sync(`${path}/Match_GameLog_**.dat`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.birthtime - a.birthtime)
      .filter(
        ({ ctime, mtime }) =>
          Math.abs(new Date(mtime).getTime() - new Date(ctime).getTime()) > 0
      );

    // Select active RecentFilters.xml
    const [recentFilters] = sync(`${path}/RecentFilters.xml`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.mtime - a.mtime)
      .map(({ name }) => name);
    if (!mtgoLogs || !recentFilters) throw new Error('No logs found.');

    // Parse and verify match data
    const matchData = mtgoLogs.map(file => getMatchData(file)).filter(Boolean);
    const matches = verifyMatchData(matchData, recentFilters).filter(Boolean);

    return matches;
  } catch (error) {
    console.error(`An error occured while parsing matches: ${error.stack}`);
  }
}

module.exports = parser;
