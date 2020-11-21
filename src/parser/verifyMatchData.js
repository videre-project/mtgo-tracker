const { readFileSync } = require('fs');
const { JSDOM } = require('jsdom');

function verifyMatchData(matchLogs, fileName) {
  try {
    const xml = readFileSync(fileName, { encoding: 'utf8' }).replace(
      '﻿<?xml version="1.0" encoding="utf-8"?>',
      ''
    );

    const xmlDoc = new JSDOM(xml, { contentType: 'text/xml' }).window.document;

    const parse = (parent, selector) => {
      const element = parent.querySelector(`${selector} *[IsSet=true] Value`);

      return element ? element.textContent : null;
    };

    const matches = Array.from(xmlDoc.getElementsByTagName('PersistedFilter'))
      .map((match, index) => {
        const gameData = matchLogs[index];
        if (!gameData) return null;

        const {
          Comments,
          OrganizationLevel,
          TournamentInitiationType,
        } = match.attributes;

        const name = Comments?.value;
        const level = OrganizationLevel?.value;
        const status = TournamentInitiationType?.value;

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
      .filter(({ id }) => id.includes('-'));

    return matches;
  } catch (error) {
    console.log(`An error occured while verifying match data: ${error.message}`);
  }
}

module.exports = verifyMatchData;
