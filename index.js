'use strict';

global.log = require('custom-logger').new({
  debug: { color: 'grey', level: 0, event: 'debug' },
  stub: { color: 'cyan', level: 1, event: 'stub' },
  info: { color: 'green', level: 2, event: 'info' },
  warn: { color: 'yellow', level: 3, event: 'warning' },
  error: { color: 'red', level: 4, event: 'ERROR' },
}).config({ level: 0 });

const { EventSystem } = require('./eventSystem');
const _serverData = require('./data_server.json');
const _serverEvents = require('./events_server.json');
const { ClassBuilder } = require('./classBuilder');
const { ClassHelper } = require('./classHelper');

const classBuilder = global.classBuilder = ClassBuilder.fromDataObject(_serverData);
const globalClass = new (classBuilder.getClass('global'))();
const eventSystem = new EventSystem(_serverEvents);
globalClass.__metadata.properties['events'].value = eventSystem;

module.exports = {
  _helper: ClassHelper,
};

module.exports._setup = fn => {
  classBuilder._classes.forEach((cls, name) => {
    if (name === 'EventSystem' || name === 'global') {
      return;
    }
    fn(name, cls);
  });
  for(const k in globalClass) {
    fn(k, globalClass[k]);
  }
  for(const k in globalClass.__metadata.properties) {
    fn(k, globalClass[k]);
  }
};