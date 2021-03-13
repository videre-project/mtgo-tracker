const { join } = require('path');
const { statSync, createReadStream } = require('fs');
const { split, mapSync } = require('event-stream');
const { JSDOM } = require('jsdom');

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
 * Parses and validates match data by file path
 * @param {String} filePath Match log file path to read & parse
 */
const parseMatch = async filePath => {
  const data = await scan(filePath);

  // Remove utf8 errors and get game actions
  const output = JSON.stringify(data)
    .replace(/[^\040-\176\200-\377]/gi, '')
    .split('@P')
    .map(line => line?.replace(/\.[^.]*$/, '.'));

  // Parse match id
  const id = filePath.replace(/.*Match_GameLog_|\.dat/g, '');

  // Calculate match time and duration
  const { ctime, mtime } = statSync(filePath);
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

  return {
    id,
    filePath,
    date,
    duration,
    players,
    log,
  };
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
 * @param {{ id: string, filePath: string }} matchLog Parsed match data
 * @param {Number} [matchIndex] Match index to validate in recentFilters. Default is `0`.
 */
const validateMatch = async (matchLog, matchIndex = 0) => {
  if (!matchLog?.filePath) return;

  // Get match path from matchLog.filePath
  const path = matchLog.filePath.replace(/Match_GameLog_.*$/, '');

  // Return XML string from RecentFilters.xml
  const xml = await scan(join(path, 'RecentFilters.xml'));

  // Create a queryable document from parsed XML
  const xmlDoc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;

  // Get match context
  const match = Array.from(xmlDoc.getElementsByTagName('PersistedFilter'))[matchIndex];
  if (!match) return matchLog;

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
  scan,
  parseMatch,
  parse,
  validateMatch,
};
