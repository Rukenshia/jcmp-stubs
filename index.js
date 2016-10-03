'use strict';

global.log = require('custom-logger').new({
  debug: { color: 'grey', level: 0, event: 'debug' },
  stub: { color: 'cyan', level: 1, event: 'stub' },
  info: { color: 'green', level: 2, event: 'info' },
  warn: { color: 'yellow', level: 3, event: 'warning' },
  error: { color: 'red', level: 4, event: 'ERROR' }
});

const { EventSystem } = require('./eventSystem');
const _serverData = require('./data_server.json');
const { ClassBuilder } = require('./classBuilder');

const classes = ClassBuilder.fromDataObject(_serverData);

module.exports = {
  events: new EventSystem(),
  jcmp: {

  },
};

classes._classes.forEach((cls, name) => {
  if (name === 'EventSystem') {
    return;
  }
  module.exports[name] = cls;
});
