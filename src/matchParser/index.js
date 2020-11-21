const { sync } = require('glob');
const { statSync } = require('fs');
const getMatchData = require('./getMatchData');
const verifyMatchData = require('./verifyMatchData');

function matchParser(path) {
  try {
    const mtgoLogs = sync(`${path}/Match_GameLog_**.dat`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.birthtime - a.birthtime)
      .filter(
        ({ ctime, mtime }) =>
          Math.abs(new Date(mtime).getTime() - new Date(ctime).getTime()) > 0
      );

    const [recentFilters] = sync(`${path}/RecentFilters.xml`)
      .map(name => ({ name, ...statSync(name) }))
      .sort((a, b) => b.mtime - a.mtime)
      .map(({ name }) => name);
    if (!mtgoLogs || !recentFilters) throw new Error('No logs found.');

    const matchData = mtgoLogs.map(file => getMatchData(file)).filter(Boolean);

    const matches = verifyMatchData(matchData, recentFilters).filter(Boolean);

    return matches;
  } catch (error) {
    console.error(`An error occured while parsing matches: ${error.stack}`);
  }
}

module.exports = matchParser;
