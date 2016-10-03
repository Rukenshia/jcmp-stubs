'use strict';

const types = {
  'string': [
    'class std::basic_string<char,struct std::char_traits<char>,class std::allocator<char> >',
  ],
  'number': [
    /^((un)?signed )?(char|float|double|int|short)$/,
  ],
  'boolean': [
    'bool',
  ],
  'function': [
    'class std::shared_ptr<class scr::IScriptFunction>',
  ],
  'undefined': [
    'void',
  ],
  

  // Special Conversions
  'Vector2': [
    /class math::basic_vector2<(.*?)>/,
  ],
  'Vector3': [
    /class math::basic_vector3<(.*?)>/,
  ],
  'JCMPNamespace': [
    /public: (.*?)::JCMPScriptNamespace \* __ptr64/,
  ],
  'Array': [
    /class std::vector<(.*?)>/,
  ],
  'Entity': [
    /class ISyncableEntity( * __ptr64)?/,
  ],
  'PlayerNameTag': [
    /class Nametag( * __ptr64)?/,
  ],
}

/**
 * Class to determine C++ types and offer conversion functions
 */
class TypeHelper {
  /**
   * Adds a Class to the Type Helper
   * 
   * @static
   * @param {string} name
   */
  static addClass(name) {
    if (typeof types[name] === 'undefined') {
      types[name] = [];
    }

    types[name].push(new RegExp(`^struct ${name}$`));
    types[name].push(new RegExp(`class (\\w+::)?I?${name} \\* __ptr64`));
  }

  /**
   * Returns Entity classes
   * 
   * @static
   * @returns {Array<string>}
   */
  static get entities() {
    return ['Player', 'Vehicle'];
  }

  /**
   * Returns the JS type string of a C++ type string
   * 
   * @param {string} raw
   * @returns {string}
   */
  static toJSType(raw) {
    let jsType = null;
    for (const key in types) {
      if (jsType) {
        break;
      }

      types[key].forEach(matcher => {
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
  static _getDefaultJSValue(typeName) {
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
  static getDefaultValue(jsType) {
    let defaultValue = TypeHelper._getDefaultJSValue(jsType);
    if (typeof defaultValue === 'undefined' && classBuilder._classes.has(jsType)) {
      // try to construct the default value
      const defaultCls = classBuilder._classes.get(jsType);
      defaultValue = new defaultCls();
    }
    return defaultValue;
  }
}

module.exports = { TypeHelper };