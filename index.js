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
const _serverEvents = require('./events_server.json');
const { ClassBuilder } = require('./classBuilder');

const classBuilder = global.classBuilder = ClassBuilder.fromDataObject(_serverData);
const globalClass = new (classBuilder.getClass('global'))();
const eventSystem = new EventSystem(_serverEvents);
globalClass.__metadata.properties['events'].value = eventSystem;

module.exports = globalClass;

classBuilder._classes.forEach((cls, name) => {
  if (name === 'EventSystem') {
    return;
  }
  module.exports[name] = cls;
});

console.log(module.exports.events);
console.log(module.exports.events);

eventSystem.Add('PlayerCreated', p => {
  console.log(p);
});

eventSystem.fakeCall('PlayerCreated');