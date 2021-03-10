const { readFileSync } = require('fs');

/**
 * Parses match data from file
 * @param {{ name: string, ctime: number, mtime: number }} metaData Match file metadata
 */
function getMatchData(metaData) {
  try {
    const { name, ctime, mtime } = metaData;
    const data = readFileSync(name, { encoding: 'utf8' });

    // Remove utf8 errors
    const output = JSON.stringify(data)
      .replace(/[^\040-\176\200-\377]/gi, '')
      .split('@P')
      .map(line => line?.replace(/\.[^.]*$/, '.'));

    // Filter seen players
    const usernames = output.reduce((usernames, line) => {
      if (!line?.includes(' joined the game')) return usernames;

      const username = line.replace(' joined the game', '');
      if (!usernames.includes(username)) usernames.push(username);

      return usernames;
    }, []);
    if (usernames.length < 2) return null;

    // Filter seen cards
    const played = output.filter(line =>
      /plays|casts|reveals|discards|exiles/.test(line)
    );

    // Enumerate seen cards per player
    const decks = usernames.map(username => {
      const deck = played.reduce((deck, line) => {
        if (!line?.includes(username)) return deck;

        const card = line.replace(/.*@\[|@[^[]*/g, '');
        if (!deck.includes(card)) deck.push(card);

        return deck;
      }, []);

      return deck;
    });

    // Calculate concessions
    const concessions = output.reduce((concessions, line) => {
      if (!/has conceded|has lost/.test(line)) return concessions;

      const concession = line.replace(/ has (conceded from|lost) the game/g, '');
      concessions.push(concession);

      return concessions;
    }, []);
    if (concessions.length < 2) {
      const concession = output
        .filter(line => line.includes(' has left the game'))
        .pop()
        ?.replace(' has left the game', '');

      concessions.push(concession);
    }

    // Parse match id
    const id = name.replace(/.*Match_GameLog_|\.dat$/g, '');

    // Calculate match time and duration
    const date = new Date(ctime).getTime();
    const duration = Math.abs(new Date(mtime).getTime() - date);

    // Bind match data to players
    const players = usernames.map((username, index) => {
      const deck = decks[index];
      const record = concessions.reduce((result, concession) => {
        let [wins, losses] = result.split('-').map(n => Number(n));

        if (concession === username) {
          losses += 1;
        } else {
          wins += 1;
        }

        return (result = `${wins}-${losses}`);
      }, '0-0');
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
      const line = input.replace(/[\\|/].*$|@(\[|[a-z])|@:\d+,\d+:@\]/g, '');

      log += `${line}\n`;

      return log;
    }, '');

    return {
      id,
      date,
      duration,
      players,
      log,
    };
  } catch (error) {
    console.error('An error occured while getting match data', error);
  }
}

module.exports = getMatchData;
