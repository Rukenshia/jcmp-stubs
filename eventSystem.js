'use strict';

class EventSystem {
  constructor() {
    this._events = new Map();
    this._remoteEvents = new Map();
  }

  _genericAdd(map, name, func) {
    if (map.has(name)) {
      map.get(name).push(func);
    } else {
      map.set(name, [func]);
    }
  }

  Add(name, func) {
    this._genericAdd(this._events, name, func);
  }

  AddRemoteCallable(name, func) {
    this._genericAdd(this._remoteEvents, name, func);
  }
}

module.exports = { EventSystem };