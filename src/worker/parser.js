const { join } = require('path');
const { statSync, createReadStream } = require('fs');
const { split, mapSync } = require('event-stream');
const { JSDOM } = require('jsdom');

/**
 * Parses and validates match data by file path
 * @param {String} filePath Matchlog file path to parse
 */
const parseMatch = async filePath => {
  const name = filePath.replace(/^.*(?=Match_GameLog_)/, '');
  const path = filePath.replace(/Match_GameLog_.*$/, '');

  const match = await getMatchData({ name, path, ...statSync(filePath) });

  return match;
};

/**
 * Creates a file stream, returning a promise.
 * @param {String} file Target file path.
 * @param {String} [encoding='utf8'] Target file encoding. Defaults to `utf8`.
 * @returns {Promise<String>} A promise, resolving with stringified file contents.
 */
const scan = (file, encoding = 'utf8') => {
  let output = '';

  return new Promise((resolve, reject) => {
    createReadStream(file, { encoding })
      .pipe(split())
      .pipe(
        mapSync(line => (output += line))
          .on('error', reject)
          .on('end', () => resolve(output))
      );
  });
};

/**
 * Parses match data from a match log
 * @param {{ name: string, ctime: number, mtime: number }} metaData Match file metadata
 */
const getMatchData = async metaData => {
  const { name, path, ctime, mtime } = metaData;
  const data = await scan(join(path, name));

  // Remove utf8 errors and get game actions
  const output = JSON.stringify(data)
    .replace(/[^\040-\176\200-\377]/gi, '')
    .split('@P')
    .map(line => line?.replace(/\.[^.]*$/, '.'));

  // Parse match id
  const id = name.replace(/Match_GameLog_|\.dat/g, '');

  // Calculate match time and duration
  const date = new Date(ctime).getTime();
  const duration = Math.abs(new Date(mtime).getTime() - date);

  // Filter seen players
  const usernames = output.reduce((usernames, line) => {
    if (!line?.includes(' joined the game')) return usernames;

    const username = line.replace(' joined the game', '');
    if (!usernames.includes(username)) usernames.push(username);

    return usernames;
  }, []);
  if (usernames.length < 2) return null;

  // Calculate concessions
  const concessions = output.reduce((concessions, line) => {
    if (!/has conceded|has lost/.test(line)) return concessions;

    const concession = line.replace(/ has (conceded from|lost) the game/g, '');
    concessions.push(concession);

    return concessions;
  }, []);
  if (concessions.length < 2) {
    const [playerExit] = output
      .filter(line => line.includes(' has left the game'))
      .reverse();

    const concession = playerExit?.replace(' has left the game', '');
    if (concession) concessions.push(concession);
  }

  // Filter seen cards
  const played = output.filter(line => /plays|casts|reveals|discards|exiles/.test(line));

  // Bind match data to players
  const players = usernames.map(username => {
    // Enumerate seen cards per player
    const deck = played.reduce((deck, line) => {
      if (!line?.includes(username)) return deck;

      const card = line.replace(/.*@\[|@[^[]*/g, '');
      if (!deck.includes(card)) deck.push(card);

      return deck;
    }, []);

    // Calculate match record
    const record = concessions.reduce((result, concession) => {
      let [wins, losses] = result.split('-').map(n => Number(n));

      if (concession === username) {
        losses += 1;
      } else {
        wins += 1;
      }

      return (result = `${wins}-${losses}`);
    }, '0-0');

    // Get wins and losses by game
    const games = concessions.map(concession => (concession === username ? 'L' : 'W'));

    return {
      username,
      deck,
      record,
      games,
    };
  });

  // Stringify and sanitize output to make human-readable
  const log = output.reduce((log, input) => {
    const line = input.replace(/\\.*$|@(\[|[a-z])|@:\d+,\d+:@\]/g, '');

    log += `${line}\n`;

    return log;
  }, '');

  // Cross-check with recentFilters, add tournament data
  const match = await verifyMatchData(
    {
      id,
      date,
      duration,
      players,
      log,
    },
    path
  );

  return match;
};

/**
 * Reads properties from XML parent
 * @param {HTMLElement} parent XML parent to parse
 * @param {string} selector XML property to select
 */
const parse = (parent, selector) => {
  const element = parent.querySelector(`${selector} *[IsSet=true] Value`);

  return element ? element.textContent : null;
};

/**
 * Syncs match data with RecentFilters.xml
 * @param {{ id: string }} matchLog Parsed match data
 * @param {String} path Match file path to look for a recentFilters file
 */
const verifyMatchData = async (matchLog, path) => {
  // Return XML string from RecentFilters.xml
  const xml = await scan(join(path, 'RecentFilters.xml'));

  // Create a queryable document from parsed XML
  const xmlDoc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;

  // Get match context
  const match = xmlDoc.querySelector('PersistedFilter');

  // Parse tournament props
  const { Comments, OrganizationLevel, TournamentInitiationType } = match.attributes;
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
    ...matchLog,
  };
};

module.exports = {
  parseMatch,
  scan,
  getMatchData,
  parse,
  verifyMatchData,
};
