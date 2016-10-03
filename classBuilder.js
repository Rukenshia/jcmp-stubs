'use strict';

const { TypeHelper } = require('./typeHelper');
const constructors = require('./constructors');

class ClassBuilder {
  constructor() {
    this._classes = new Map();

    this._addHelperClasses();
  }

  _addHelperClasses() {
    this._classes.set('Entity', class Entity { });
    TypeHelper.addClass(this._classes.get('Entity'));
  }

  static fromDataObject(data) {
    const cb = new ClassBuilder();
    data.forEach(obj => {
      cb._classes.set(obj.name, cb._buildClass(obj));
    });

    data.forEach(obj => {
      const cls = cb._classes.get(obj.name);
      obj.properties.forEach(prop => {
        const jsType = TypeHelper.toJSType(prop.type);
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
        const jsReturnType = TypeHelper.toJSType(fn.returnType);
        log.debug(`function ${obj.name}.${fn.name} return type: ${jsReturnType}`);
        cls.__metadata.functions[fn.name].jsReturnType = jsReturnType;
        fn.args.forEach((arg, idx) => {
          const jsType = TypeHelper.toJSType(arg);
          log.debug(`function ${obj.name}.${fn.name}[arg ${idx}] type: ${jsType}`);
          cls.__metadata.functions[fn.name].args[idx].jsType = jsType;
        });
      });
    });

    return cb;
  }

  getClass(name) {
    return this._classes.get(name);
  }

  _checkType(expected, present) {
    const presentType = typeof present;
    if (presentType !== expected) {
      if (presentType === 'object') {
        const possibleClasses = [expected];
        if (expected === 'Entity') {
          possibleClasses.push(...TypeHelper.entities);
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

  _buildClass(obj) {
    const cb = this;
    const clsObj = {
      _destroyed: false,
      [obj.name]: function(...args) {
        if (!obj.isConstructible) {
          log.warn(`Constructing non-constructible class '${obj.name}'`);
        }
        log.stub(`${obj.name}.constructor(${args.join(', ')})`);

        for (const propName in cls.__metadata.properties) {
          this.__metadata.properties[propName] = {
            value: TypeHelper.getDefaultValue(cls.__metadata.properties[propName].jsType),
          };
        }

        if (typeof constructors[obj.name] !== 'undefined') {
          constructors[obj.name].bind(this)(...args);
        }
      }
    };
    const cls = clsObj[obj.name];
    cls.__metadata = {
      constructible: obj.isConstructible,
      properties: {},
      functions: {},
    };
    cls.prototype.__metadata = {
      properties: {},
      functions: {},
    };

    TypeHelper.addClass(obj.name);

    const destroyGuard = () => {
      if (clsObj._destroyed) {
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
        if (destroyGuard()) { return };

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
        log.stub(`${obj.name}.${info.name}(${args.join(', ')})`);

        return TypeHelper.getDefaultValue(cls.__metadata.functions[info.name].jsReturnType);
      };
    };
    const genGet = name => {
      log.debug(`genGet(${obj.name}.${name})`);
      return function() {
        if (destroyGuard()) { return };
        log.stub(`get ${obj.name}.${name}`);
        return this.__metadata.properties[name].value;
      };
    };
    const genSet = info => {
      log.debug(`genSet(${obj.name}.${info.name})`);
      return function(value) {
        if (destroyGuard()) { return };
        if (!info.isWriteable) {
          log.error(`trying to set readOnly ${obj.name}.${info.name}`);
          return;  
        }
        if (!cb._checkType(cls.__metadata.properties[info.name].jsType, value)) {
          throw new Error(`cannot set value of ${obj.name}.${info.name}: expected ${cls.__metadata.properties[info.name].jsType}, got ${typeof value}`);
        }
        log.stub(`set ${obj.name}.${info.name}`);
        this.__metadata.properties[info.name].value = value;
      };
    }

    if (!obj.isAutoDestroy) {
      cls.prototype.Destroy = () => {
        if (destroyGuard()) { return };
        clsObj._destroyed = true;
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
