# MTGO Tracker
A lightweight open-source MTGO tracker.

## Table of contents
- [Features](#features)
- [Install and Run](#install--run)
- [Usage](#usage)

## Features
Currently, MTGO-Tracker supports the following:

 - [x] Gamelog filtering and auto-detect
 - [x] Match verification

## Install & run

Make sure you have nodejs and yarn installed. Install dependencies with:

```bash
yarn
```

To run tests:

```bash
yarn test
```

## Usage

```js
import path from 'path';
import mtgoTracker from 'mtgoTracker';

// Path defaults to MTGO application data
const path = path.resolve(__dirname, '../matches');

console.log(mtgoTracker(path));
```

### Returns

```js
[
  {
    date,
    duration,
    format,
    formatType,
    id,
    level,
    log,
    name,
    players,
    status,
    tournamentType,
  }
]
```
