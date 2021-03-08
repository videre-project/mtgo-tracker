const { readFileSync } = require('fs');
const { JSDOM } = require('jsdom');

/**
 * Reads properties from XML parent
 */
function parse(parent, selector) {
  const element = parent.querySelector(`${selector} *[IsSet=true] Value`);

  return element ? element.textContent : null;
}

/**
 * Syncs match data with RecentFilters.xml
 */
function verifyMatchData(matchLogs, fileName) {
  try {
    // Return XML string from RecentFilters.xml
    const xml = readFileSync(fileName, { encoding: 'utf8' });

    // Create a queryable document from parsed XML
    const { window } = new JSDOM('');
    const xmlDoc = new window.DOMParser().parseFromString(xml, 'application/xml');

    const matches = Array.from(xmlDoc.getElementsByTagName('PersistedFilter'))
      .map((match, index) => {
        // Sync PersistedFilter with match data
        const gameData = matchLogs[index];
        if (!gameData) return null;

        // Parse tournament props
        const {
          Comments,
          OrganizationLevel,
          TournamentInitiationType,
        } = match.attributes;
        const name = Comments?.value;
        const level = OrganizationLevel?.value;
        const status = TournamentInitiationType?.value;

        // Parse format props
        const format = parse(match, 'PlayFormat');
        const formatType = parse(match, 'DeckCreationStyle');
        const tournamentType = parse(match, 'TournamentStructureValue');

        return {
          name,
          level,
          status,
          format,
          formatType,
          tournamentType,
          ...gameData,
        };
      })
      .filter(Boolean)
      // Remove replays from match history
      .filter(({ id }) => id.includes('-'));

    return matches;
  } catch (error) {
    console.log(`An error occured while verifying match data: ${error.message}`);
  }
}

module.exports = verifyMatchData;
