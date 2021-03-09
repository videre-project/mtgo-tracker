const { readFileSync } = require('fs');

/**
 * Parses match data from file
 * @param {{ name: string, ctime: number, mtime: number }} metaData Match file metadata
 */
function getMatchData(metaData) {
  try {
    const { name, ctime, mtime } = metaData;
    const data = readFileSync(name, { encoding: 'utf8' });

    // Remove utf8 errors and create an array of game actions
    const output = JSON.stringify(data)
      .replace(/[^\040-\176\200-\377]/gi, '') // Remove utf8 errors.
      .split('@P')
      .map(line => {
        const hasHintText = line.includes('.).');
        const string = line.substring(
          0,
          hasHintText ? line.indexOf('.).') : line.indexOf('.')
        );

        return hasHintText ? `${string}.)` : string;
      })
      .filter(Boolean);

    // Filter seen players
    const usernames = [
      ...new Set(
        output
          .filter(line => line.includes(' joined the game'))
          .map(line => line.replace(' joined the game', ''))
      ),
    ];
    if (usernames.length !== 2) return null;

    // Filter seen cards
    const cards = output.filter(line => /plays|casts|reveals|discards|exiles/.test(line));

    // Enumerate seen cards per player
    const decks = usernames.map(username => {
      const deck = cards
        .filter(line => line.includes(username))
        .filter(Boolean)
        .map(line => line?.split('@[')[1]?.split('@')[0]);

      return deck?.filter((card, index) => deck.indexOf(card) === index)?.filter(Boolean);
    });

    // Calculate concessions
    const concessions = output
      .filter(line => /has conceded|has lost/.test(line))
      .map(line => line.replace(/ has (conceded from|lost) the game/g, ''));
    if (concessions.length < 2) {
      const concession = output
        .filter(line => line.includes(' has left the game'))
        .pop()
        ?.replace(' has left the game', '');

      concessions.push(concession);
    }

    if (concessions.length < 2) return null;

    // Parse match id
    const id = name.replace(/.*Match_GameLog_|\.dat$/g, '');

    // Calculate match start time
    const date = new Date(ctime).getTime();

    // Calculate match duration
    const duration = Math.abs(new Date(mtime).getTime() - date);

    // Bind match data to players
    const players = usernames.map((username, index) => {
      const deck = decks[index];
      const wins = concessions.filter(concession => concession !== username).length;
      const losses = concessions.filter(concession => concession === username).length;
      const record = `${wins}-${losses}`;
      const games = concessions.map(concession => (concession === username ? 'L' : 'W'));

      return {
        username,
        deck,
        record,
        games,
      };
    });

    // Clean log to make human-readable
    const log = output
      .map(line => {
        if (line.includes('\\')) return line.split('\\')[0];
        if (!line.includes('@[')) return line;

        const fragments = line.split('@[').map(fragment =>
          fragment
            .replace('@]', '@')
            .split('@')
            .filter(fragment => !fragment.includes(':'))
            .join('')
        );

        return `${fragments.join('')}.`;
      })
      .join('\n');

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
