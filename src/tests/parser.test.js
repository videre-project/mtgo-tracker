import { readdirSync } from 'fs';
import { join } from 'path';
import { parseMatch, validateMatch } from 'worker/parser';

describe('parser', () => {
  let match;

  beforeAll(async () => {
    const log = readdirSync(join(__dirname, 'data')).find(file =>
      file.startsWith('Match_GameLog_')
    );

    const matchData = await parseMatch(join(__dirname, 'data', log));
    match = await validateMatch(matchData);
  });

  it('gets tournament data', () => {
    expect(match.name).toBe('Project Modern League');
    expect(match.level).toBe('OpenPlay');
    expect(match.status).toBe('Uninitialized');
    expect(match.format).toBe('CFREEFORM');
    expect(match.formatType).toBe('Constructed');
    expect(match.tournamentType).toBe(null);
  });

  it('gets match data', () => {
    expect(match.id).toBe('cd9cc466-0607-45f3-b7e2-d9dfd4d83bb3');
    expect(typeof match.date).toBe('number');
    expect(typeof match.duration).toBe('number');
    expect(typeof match.log).toBe('string');
  });

  it('gets player data', () => {
    match.players.forEach(player => {
      expect(typeof player.username).toBe('string');
      expect(player.deck?.length).toBeTruthy();
      expect(player.record).toMatch(/[0-2]-[0-2]/);
      expect(player.games?.length).toBeTruthy();
    });
  });
});
