'use strict';

class ClassHelper {
  static setPropertyUnchecked(instance, name, value) {
    if (typeof instance.__metadata.properties[name] === 'undefined') {
      throw new Error('cannot set property with undefined metadata');
    }
    instance.__metadata.properties[name].value = value;
  }

  static build(name, fn = () => {}, ...args) {
    if (!classBuilder._classes.has(name)) {
      throw new Error(`cannot build non-existing class ${name}`);
    }
    const cls = new (classBuilder.getClass(name))(...args);
    fn({
      c: cls,
      set: (n, v) => ClassHelper.setPropertyUnchecked(cls, n, v),
    });
    return cls;
  }
}

module.exports = { ClassHelper };