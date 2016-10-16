'use strict';
require('./log');
const { EventSystem } = require('./eventSystem');
const _serverData = require('./data_server.json');
const _serverEvents = require('./events_server.json');
const { ClassBuilder } = require('./classBuilder');
const { ClassHelper } = require('./classHelper');

/** @type {ClassBuilder} */ const classBuilder = global.classBuilder = ClassBuilder.fromDataObject(_serverData);
const globalClass = new (classBuilder.getClass('global'))();
const eventSystem = new EventSystem(_serverEvents);
globalClass.__metadata.properties['events'].value = eventSystem;

/**
 * Exporting Helper Class
 * 
 */
module.exports = {
  _helper: ClassHelper,
  _log: log,
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