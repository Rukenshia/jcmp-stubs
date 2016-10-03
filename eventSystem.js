'use strict';

const { TypeHelper } = require('./typeHelper');

class EventSystem {
  constructor(builtin) {
    this._events = new Map();
    this._remoteEvents = new Map();

    this._builtins = new Map();
    builtin.forEach(ev => {
      this._builtins.set(ev.name, ev.parameters);
    });
  }

  _genericAdd(map, name, func) {
    if (map.has(name)) {
      map.get(name).push(func);
    } else {
      map.set(name, [func]);
    }
  }

  _genericCall(map, name, ...args) {
    if (map.has(name)) {
      map.get(name).forEach(fn => fn(...args));
    }
  }

  Add(name, func) {
    this._genericAdd(this._events, name, func);
  }

  AddRemoteCallable(name, func) {
    this._genericAdd(this._remoteEvents, name, func);
  }

  fakeCall(name) {
    if (!this._builtins.has(name)) {
      log.error(`invalid fakeCall to '${name}`);
      return;
    }

    const args = [];
    this._builtins.get(name).forEach(({ ptype }) => {
      args.push(TypeHelper.getDefaultValue(ptype));
    });

    log.stub(`fake event call to '${name}'`);
    this._genericCall(this._events, name, ...args);
  }
}

module.exports = { EventSystem };