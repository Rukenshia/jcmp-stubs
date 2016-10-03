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
    const retns = [];
    if (map.has(name)) {
      map.get(name).forEach(fn => retns.push(fn(...args)));
    }
    return retns;
  }

  Add(name, func) {
    log.stub(`EventSystem.Add(${name}, ${typeof func})`);
    this._genericAdd(this._events, name, func);
  }

  AddRemoteCallable(name, func) {
    log.stub(`EventSystem.AddRemoteCallable(${name}, ${typeof func})`);
    this._genericAdd(this._remoteEvents, name, func);
  }

  Call(name, ...args) {
    log.stub(`EventSystem.Call(${name}${args.length > 0 ? `, ${args.join(', ')}` : ''})`);
    return this._genericCall(this._events, name, ...args);
  }

  CallRemote(name, target, ...args) {
    log.stub(`EventSystem.Call(${name}, ${target}${args.length > 0 ? `, ${args.join(', ')}` : ''})`);
    return this._genericCall(this._remoteEvents, name, ...args);
  }

  fakeCall(name, ...customArgs) {
    if (!this._builtins.has(name)) {
      log.error(`invalid fakeCall to '${name}`);
      return;
    }

    const args = [];
    if (customArgs.length > 0) {
      args.push(...customArgs);
    } else {
      this._builtins.get(name).forEach(({ ptype }) => {
        args.push(TypeHelper.getDefaultValue(ptype));
      });
    }

    log.stub(`fake event call to '${name}'`);
    this._genericCall(this._events, name, ...args);
  }
}

module.exports = { EventSystem };