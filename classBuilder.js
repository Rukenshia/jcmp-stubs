'use strict';

require('./log');
const { TypeHelper } = require('./typeHelper');
const { constructors, similarClasses } = require('./overrides');
const hooks = require('./hooks');

/**
 * A Scripting Class
 * @typedef {object} Class
 */
/**
 * A Scripting Parameter
 * @typedef {any} Parameter
 */
/**
 * A Scripting function
 * @typedef {function()} Function
 */
/**
 * Property info
 * @typedef {object} Property
 * @type {object}
 * @property {string} name 
 * @property {string} type
 * @property {boolean} isWriteable
 */
/**
 * Function info
 * @typedef {object} FunctionInfo
 * @type {object}
 * @property {string} name 
 * @property {string} returnType
 * @property {Array<string>} args
 */


/**
 * ClassBuilder is responisble for creating JS Classes for the Data received from the scripting-docs json files.
 */
class ClassBuilder {
  /**
   * Creates a new instance of ClassBuilder
   */
  constructor() {
    /** @type {Map<string, Class>} */ this._classes = new Map();
    /** @type {TypeHelper} */ this.typeHelper = new TypeHelper(this, {
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
    });

    this._addHelperClasses();
  }

  /**
   * Adds proprietary helper Classes
   * 
   * @private
   */
  _addHelperClasses() {
    this._classes.set('Entity', class Entity { });
    this.typeHelper.addClass(this._classes.get('Entity'));
  }

  /**
   * Creates a new ClassBuilder from JSON object data
   * 
   * @static
   * @param {Array<object>} data - object data from the scripting-docs
   * 
   * @returns {ClassBuilder}
   */
  static fromDataObject(data) {
    const cb = new ClassBuilder();
    data.forEach(obj => {
      cb._classes.set(obj.name, cb._buildClass(obj));
    });

    data.forEach(obj => {
      const cls = cb._classes.get(obj.name);
      obj.properties.forEach(prop => {
        const jsType = cb.typeHelper.toJSType(prop.type);
        log.debug(`property ${obj.name}.${prop.name} type: ${jsType}`);

        const cls = cb._classes.get(obj.name);
        cls.__metadata.properties[prop.name] = {
          jsType,
        };
      });

      obj.functions.forEach(fn => {
        if (fn.name === 'Destroy') {
          return;
        }
        const jsReturnType = cb.typeHelper.toJSType(fn.returnType);
        log.debug(`function ${obj.name}.${fn.name} return type: ${jsReturnType}`);
        cls.__metadata.functions[fn.name].jsReturnType = jsReturnType;
        fn.args.forEach((arg, idx) => {
          const jsType = cb.typeHelper.toJSType(arg);
          log.debug(`function ${obj.name}.${fn.name}[arg ${idx}] type: ${jsType}`);
          cls.__metadata.functions[fn.name].args[idx].jsType = jsType;
        });
      });
    });

    return cb;
  }

  /**
   * Helper function to retrieve a Class from the Builder.
   * 
   * @param {string} name - class name
   * @returns {Class}
   */
  getClass(name) {
    return this._classes.get(name);
  }

  /**
   * Checks the argument type
   * 
   * @private
   * @param {*} expected - expected type
   * @param {*} present - present value(!)
   * @returns {boolean}
   */
  _checkType(expected, present) {
    const presentType = typeof present;
    if (presentType !== expected) {
      if (presentType === 'object') {
        const possibleClasses = [expected];
        if (expected === 'Entity') {
          possibleClasses.push(...this.typeHelper.entities);
        }
        if (typeof similarClasses[expected] !== 'undefined') {
          possibleClasses.push(...similarClasses[expected]);
        }
        for (let clsName of possibleClasses) {
          if (this._classes.has(clsName)) {
            const cls = this._classes.get(clsName);
            if (present instanceof cls) {
              return true;
            }
          }
        }
      }
      return false;
    }
    return true;
  }

  /**
   * Creates a new class from the object data.
   * 
   * @private
   * @param {object} obj - object data
   * @param {boolean} isConstructible
   * @param {boolean} isAutoDestroy
   * @param {Array<PropertyInfo>} properties
   * @param {Array<FunctionInfo>} functions
   */
  _buildClass(obj) {
    const cb = this;
    const clsObj = {
      [obj.name]: function(...args) {
        if (!obj.isConstructible) {
          log.warn(`Constructing non-constructible class '${obj.name}'`);
        }
        log.fstub(`${obj.name}.constructor(${args.join(', ')})`);

        this.__metadata = {
          enableSetterGuard: false,
          destroyed: false,
          properties: {},
          functions: {},
        };

        const unset = Symbol('UNSET_VALUE');

        // create the properties, but leave them empty for now
        for (const propName in cls.__metadata.properties) {
          this.__metadata.properties[propName] = { value: unset };
        }

        if (typeof constructors[obj.name] !== 'undefined') {
          constructors[obj.name].bind(this)(...args);
        }

        this.__metadata.enableSetterGuard = true;

        for (const propName in cls.__metadata.properties) {
          if (this.__metadata.properties[propName].value === unset) {
            this.__metadata.properties[propName] = {
              value: cb.typeHelper.getDefaultValue(cls.__metadata.properties[propName].jsType),
            };
          }
        }
      }
    };
    const cls = clsObj[obj.name];
    cls.__metadata = {
      constructible: obj.isConstructible,
      properties: {},
      functions: {},
    };

    const classHooks = hooks[obj.name] || {};

    this.typeHelper.addClass(obj.name);

    const destroyGuard = function() {
      if (this.__metadata.destroyed) {
        log.error(`used instance of ${obj.name} has been destroyed!`);
        return true;
      }
    };
    const genStub = info => {
      log.debug(`genStub(${obj.name}.${info.name})`);
      cls.__metadata.functions[info.name] = {
        args: [],
      };
      for (let i = 0; i < info.args.length; i++) {
        cls.__metadata.functions[info.name].args.push({});
      }
      return function(...args) {
        if (destroyGuard.bind(this)()) { return };

        const metaArgs = cls.__metadata.functions[info.name].args;
        if (metaArgs.length > args.length) {
          throw new Error(`${obj.name}.${info.name}: expected ${metaArgs.length} arguments, found ${args.length}`);
        }

        for (let i = 0; i < metaArgs.length; i++) {
          const metaArg = metaArgs[i];
          const arg = args[i];

          if (!cb._checkType(metaArg.jsType, arg)) {
            throw new Error(`${obj.name}.${info.name} argument ${i + 1}: expected ${metaArg.jsType}, got ${typeof arg}`);
          }
        }
        log.fstub(`${obj.name}.${info.name}(${args.join(', ')})`);

        if (typeof classHooks[info.name] !== 'undefined') {
          log.debug(`executing hook for ${obj.name}.${info.name}`);
          return classHooks[info.name].bind(this)(...args) || this.typeHelper.getDefaultValue(cls.__metadata.functions[info.name].jsReturnType);
        }

        return this.typeHelper.getDefaultValue(cls.__metadata.functions[info.name].jsReturnType);
      };
    };
    const genGet = name => {
      log.debug(`genGet(${obj.name}.${name})`);
      return function() {
        if (destroyGuard.bind(this)()) { return };
        log.pstub(`get ${obj.name}.${name}`);
        return this.__metadata.properties[name].value;
      };
    };
    const genSet = info => {
      log.debug(`genSet(${obj.name}.${info.name})`);
      return function(value) {
        if (destroyGuard.bind(this)()) { return };
        if (!info.isWriteable && this.__metadata.enableSetterGuard) {
          throw new Error(`cannot set readOnly ${obj.name}.${info.name}!`);
        }
        if (!cb._checkType(cls.__metadata.properties[info.name].jsType, value)) {
          throw new Error(`cannot set value of ${obj.name}.${info.name}: expected ${cls.__metadata.properties[info.name].jsType}, got ${typeof value}`);
        }
        log.pstub(`set ${obj.name}.${info.name}`);
        this.__metadata.properties[info.name].value = value;
      };
    }

    if (!obj.isAutoDestroy) {
      cls.prototype.Destroy = function() {
        if (destroyGuard.bind(this)()) { return };
        
        if (typeof classHooks[info.name] !== 'undefined') {
          classHooks[info.name].bind(this)();  
        }
        this.__metadata.destroyed = true;
        log.debug(`instance of ${obj.name} destroyed`);
      }
    }

    obj.functions.forEach(fn => {
      if (fn.name === 'Destroy') { return; }
      cls.prototype[fn.name] = genStub(fn);
    });

    obj.properties.forEach(prop => {
      Object.defineProperty(cls.prototype, prop.name, {
        get: genGet(prop.name),
        set: genSet(prop),
      });
    });

    return clsObj[obj.name];
  }
}

module.exports = { ClassBuilder };
