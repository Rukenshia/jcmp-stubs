'use strict';

require('./log');
const { TypeHelper } = require('./typeHelper');

/**
 * EventParameter 
 * @typedef {object} EventParameterInfo
 * @type {object}
 * @property {string} name
 * @property {string} ptype
 */
/**
 * JC3:MP Event
 * @typedef {object} EventInfo
 * @type {object}
 * @property {string} name
 * @property {Array<EventParameterInfo>} parameters
 */

/**
 * Emulated JC3:MP Event System
 */
class EventSystem {
  /**
   * Creates a new Instance of the EventSystem
   * 
   * @param {Array<EventInfo>} builtin - JC3:MP builtin events
   */
  constructor(builtin) {
    /** @type {Map<string, Array<function>>} */ this._events = new Map();
    /** @type {Map<string, Array<function>>} */ this._remoteEvents = new Map();

    /** @type {Map<string, Array<EventParameterInfo>>} */ this._builtins = new Map();
    builtin.forEach(ev => {
      this._builtins.set(ev.name, ev.parameters);
    });
  }

  /**
   * Adds a Handler to a Map
   * 
   * @private
   * @param {Map<string, Array<function>>} map
   * @param {string} name
   * @param {function} func
   */
  _genericAdd(map, name, func) {
    if (map.has(name)) {
      map.get(name).push(func);
    } else {
      map.set(name, [func]);
    }
  }

  /**
   * Calls a Event from a Map
   * 
   * @private
   * @param {Map<string, Array<function>>} map
   * @param {string} name
   * @param {any} ...args
   * @returns {Array<any>}
   */
  _genericCall(map, name, ...args) {
    const retns = [];
    if (map.has(name)) {
      map.get(name).forEach(fn => retns.push(fn(...args)));
    }
    return retns;
  }


  /**
   * Adds an Event Handler
   * 
   * @param {string} name
   * @param {function} func
   */
  Add(name, func) {
    log.fstub(`EventSystem.Add(${name}, ${typeof func})`);
    this._genericAdd(this._events, name, func);
  }

  /**
   * Adds an remote Event Handler
   * 
   * @param {string} name
   * @param {function} func
   */
  AddRemoteCallable(name, func) {
    log.fstub(`EventSystem.AddRemoteCallable(${name}, ${typeof func})`);
    this._genericAdd(this._remoteEvents, name, func);
  }

  /**
   * Calls an Event
   * 
   * @param {string} name
   * @param {any} ...args
   * @returns {Array<any>}
   */
  Call(name, ...args) {
    log.event(`EventSystem.Call(${name}${args.length > 0 ? `, ${args.join(', ')}` : ''})`);
    return this._genericCall(this._events, name, ...args);
  }


  /**
   * Calls an remote Event
   * 
   * @param {string} name
   * @param {null|object} target
   * @param {any} ...args
   * @returns {Array<any>}
   */
  CallRemote(name, target, ...args) {
    log.event(`EventSystem.CallRemote(${name}, ${target}${args.length > 0 ? `, ${args.join(', ')}` : ''})`);
  }


  /**
   * Fakes a JC3:MP sided Event Call
   * 
   * @param {string} name
   * @param {any} ...args
   * @returns {Array<any>}
   */
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

    log.event(`fake event call to '${name}'`);
    return this._genericCall(this._events, name, ...args);
  }
}

module.exports = { EventSystem };