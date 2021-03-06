'use strict';

/**
 * Class to determine C++ types and offer conversion functions
 */
class TypeHelper {
  /**
   * Creates a new Instance of TypeHelper
   * 
   * @param {ClassBuilder} classBuilder - associated class builder
   * @param {Object} types - initial types
   */
  constructor(classBuilder, types = {}) {
    this.types = types;
    this.classBuilder = classBuilder;
  }
  /**
   * Adds a Class to the Type Helper
   * 
   * @static
   * @param {string} name
   */
  addClass(name) {
    if (typeof this.types[name] === 'undefined') {
      this.types[name] = [];
    }

    this.types[name].push(new RegExp(`^struct ${name}$`));
    this.types[name].push(new RegExp(`class (\\w+::)?I?${name} \\* __ptr64`));

    if (typeof name === 'string' && name.includes('Handling')) {
      const pos = name.indexOf('Handling') + 8;

      const sub = name.substr(0, pos) + name.substr(pos).replace(/[A-Z]/g, '(::)?$&');
      this.types[name].push(new RegExp(`struct (.*?)${sub}\\s*(\\* __ptr64)?\\s*$`));
    }
  }

  /**
   * Returns Entity classes
   * 
   * @static
   * @returns {Array<string>}
   */
  get entities() {
    return ['Player', 'Vehicle'];
  }

  /**
   * Returns the JS type string of a C++ type string
   * 
   * @param {string} raw
   * @returns {string}
   */
  toJSType(raw) {
    let jsType = null;
    for (const key in this.types) {
      if (jsType) {
        break;
      }

      if (key === raw) {
        return key;
      }

      this.types[key].forEach(matcher => {
        if (jsType) {
          return;
        }
        if (typeof matcher === 'string') {
          if (matcher === raw) {
            jsType = key;
          }
        } else {
          if (matcher.test(raw)) {
            jsType = key;
          }
        }
      });
    }
    if (jsType === null) {
      log.error(raw);
    }
    return jsType;
  }

  /**
   * Returns the default value of a JS type
   * 
   * @private
   * @static
   * @param {string} typeName
   * @param {any}
   */
  _getDefaultJSValue(typeName) {
    return {
      'string': '',
      'number': 0,
      'object': {},
      'Array': [],
      'boolean': false,
    }[typeName];
  }

  /**
   * Returns the default value for a type (JS or generated Class)
   * 
   * @static
   * @param {string} jsType
   * @returns {any}
   */
  getDefaultValue(jsType) {
    let defaultValue = this._getDefaultJSValue(jsType);
    if (typeof defaultValue === 'undefined' && this.classBuilder._classes.has(jsType)) {
      // try to construct the default value
      const defaultCls = this.classBuilder._classes.get(jsType);
      defaultValue = new defaultCls();
    }
    return defaultValue;
  }
}

module.exports = { TypeHelper };