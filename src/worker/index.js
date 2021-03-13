const { Worker, isMainThread, parentPort } = require('worker_threads');
const { join } = require('path');
const { sync } = require('glob');
const { statSync } = require('fs');
const { parseMatch } = require('./parser');

// Worker execution
if (!isMainThread) {
  parentPort.onmessage = async ({ data }) => {
    // Parse and verify match data
    const match = await parseMatch(data);

    parentPort.postMessage(match);
  };
}

/**
 *
 * @param {String} files An array of file paths to process
 * @param {Function} callback A callback to execute after each match is processed
 */
const fetchMatches = (files, callback) => {
  files.forEach(file => {
    const worker = new Worker(__filename);

    worker.on('message', matches => {
      if (matches) callback(matches);
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
  const needsUpdate = sync(join(path, 'Match_GameLog_**.dat')).reduce((matches, file) => {
    const id = file.replace(/.*Match_GameLog_|\.dat$/g, '');
    const match = { id, ...statSync(file) };

    if (match.ctime !== previousMatches[id]?.ctime) {
      matches.push(file);

      previousMatches[id] = match;
    }

    return matches;
  }, []);

  if (needsUpdate.length) {
    fetchMatches(needsUpdate, callback);
  }
};

module.exports = { fetchMatches, updateMatches };
