const { readFileSync } = require('fs');
const { JSDOM } = require('jsdom');

/**
 * Reads properties from XML parent
 * @param {HTMLElement} parent XML parent to parse
 * @param {string} selector XML property to select
 */
function parse(parent, selector) {
  const element = parent.querySelector(`${selector} *[IsSet=true] Value`);

  return element ? element.textContent : null;
}

/**
 * Syncs match data with RecentFilters.xml
 * @param {Array.<{ id: string }>} matchLogs Parsed match data
 * @param {string} recentFilters RecentFilters file path
 */
function verifyMatchData(matchLogs, recentFilters) {
  try {
    // Return XML string from RecentFilters.xml
    const xml = readFileSync(recentFilters, { encoding: 'utf8' });

    // Create a queryable document from parsed XML
    const xmlDoc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;

    const matches = Array.from(xmlDoc.getElementsByTagName('PersistedFilter'))
      .map((match, index) => {
        // Sync PersistedFilter with match data, remove replays
        const gameData = matchLogs[index];
        if (!gameData?.id.includes('-')) return null;

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
      .filter(Boolean);

    return matches;
  } catch (error) {
    console.error('An error occured while verifying match data', error);
  }
}

module.exports = verifyMatchData;
