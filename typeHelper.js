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
  'PlayerNametag': [
    /class Nametag( * __ptr64)?/,
  ],
}

class TypeHelper {
  static addClass(name) {
    if (typeof types[name] === 'undefined') {
      types[name] = [];
    }

    types[name].push(new RegExp(`^struct ${name}$`));
    types[name].push(new RegExp(`class (\\w+::)?I?${name} \\* __ptr64`));
  }

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

  static getDefaultValue(typeName) {
    return {
      'string': '',
      'number': 0,
      'object': {},
      'Array': [],
      'boolean': false,
    }[typeName] || undefined;
  }
}

module.exports = { TypeHelper };