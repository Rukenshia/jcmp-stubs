'use strict';

const { TypeHelper } = require('./typeHelper');

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
      obj.properties.forEach(prop => {
        const jsType = TypeHelper.toJSType(prop.type);
        log.debug(`property ${obj.name}.${prop.name} type: ${jsType}`);

        let defaultValue = TypeHelper.getDefaultValue(jsType);

        cb._classes.get(obj.name).__metadata.properties[prop.name] = {
          jsType,
          defaultValue,
        };
      });
    });

    return cb;
  }

  getClass(name) {
    return this._classes.get(name);
  }

  _buildClass(obj) {
    const cb = this;
    const clsObj = {
      _destroyed: false,
      [obj.name]: function() {
        if (!obj.isConstructible) {
          log.warn(`Constructing non-constructible class '${obj.name}'`);
        }
        log.stub(`${obj.name}.constructor`);

        for (const propName in cls.__metadata.properties) {
          if (typeof this.__metadata.properties[propName] === 'undefined') {
            let defaultValue = cls.__metadata.properties[propName].defaultValue;
            if (typeof defaultValue === 'undefined' && cb._classes.has(cls.__metadata.properties[propName].jsType)) {
              // try to construct the default value
              const defaultCls = cb._classes.get(cls.__metadata.properties[propName].jsType);
              defaultValue = new defaultCls();
            }
            this.__metadata.properties[propName] = {
              value: defaultValue,
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
    const genStub = name => {
      return () => {
        if (destroyGuard()) { return };
        log.stub(`${obj.name}.${name}`);
      };
    };
    const genGet = name => {
      return function() {
        if (destroyGuard()) { return };
        log.stub(`get ${obj.name}.${name}`);
        return this.__metadata.properties[name].value;
      };
    };
    const genSet = info => {
      return function(value) {
        if (destroyGuard()) { return };
        if (!info.isWriteable) {
          log.error(`trying to set readOnly ${obj.name}.${info.name}`);
          return;  
        }
        log.stub(`set ${obj.name}.${info.name} -- TODO: TYPECHECK`);
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
      cls.prototype[fn.name] = genStub(fn.name);
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
