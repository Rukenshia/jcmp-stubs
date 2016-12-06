'use strict';
require('./log');
const { EventSystem } = require('./eventSystem');
const { ClassBuilder } = require('./classBuilder');
const { ClassHelper } = require('./classHelper');
const { TypeHelper } = require('./typeHelper');


/**
 * Exporting Helper Class
 * 
 */
module.exports = {
  ClassHelper,
  ClassBuilder,
  TypeHelper,
  EventSystem,
  _setup(builder, eventSystem, fn) {
    const globalClass = new (builder.getClass('global'))();
    globalClass.__metadata.properties['events'].value = eventSystem;
    builder._classes.forEach((cls, name) => {
      if (name === 'global') {
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
  },
  _log: log,
};