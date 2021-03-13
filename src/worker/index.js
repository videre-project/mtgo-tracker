const { Worker, isMainThread, parentPort } = require('worker_threads');
const { join } = require('path');
const { sync } = require('glob');
const { statSync } = require('fs');
const { parseMatch, validateMatch } = require('./parser');

// Worker execution
if (!isMainThread) {
  parentPort.onmessage = async ({ data }) => {
    const { filePath, index } = data;

    // Parse and verify match data
    const matchData = await parseMatch(filePath);
    const match = await validateMatch(matchData, index);

    parentPort.postMessage(match);
  };
}

/**
 * Dispatches workers to fetch an array of matches, executing a callback for each match.
 * @param {Array.<{ filePath: String, index?: Number }>} files An array of file paths to process
 * @param {Function} callback A callback to execute after each match is processed
 */
const fetchMatches = (files, callback) => {
  files.forEach(file => {
    const worker = new Worker(__filename);

    worker.on('message', match => {
      if (match) callback(match);
    });

    worker.postMessage(file);
  });
};

// Previous match results
const previousMatches = {};

/**
 * Handles match log updates via workers
 * @param {String} path Match logs' file path
 * @param {Function} callback Callback to invoke on match update
 */
const updateMatches = (path, callback) => {
  const needsUpdate = sync(join(path, 'Match_GameLog_**.dat')).reduce(
    (matches, filePath, index) => {
      const id = filePath.replace(/.*Match_GameLog_|\.dat$/g, '');
      const match = { id, filePath, index, ...statSync(filePath) };
      const previousMatch = previousMatches[id];

      if (!previousMatch || match.ctime > previousMatch.ctime) {
        matches.push(match);

        previousMatches[id] = match;
      }

      return matches;
    },
    []
  );

  if (needsUpdate.length) {
    fetchMatches(needsUpdate, callback);
  }
};

module.exports = { fetchMatches, updateMatches };
