'use strict';

/**
 * ClassHelper contains various functions to emulate the JC3:MP server
 */
class ClassHelper {
  /**
   * Sets a property, circumventing isWriteable restrictions
   * 
   * @static
   * @param {Class} instance
   * @param {string} name
   * @param {any} value
   */
  static setPropertyUnchecked(instance, name, value) {
    if (typeof instance.__metadata.properties[name] === 'undefined') {
      throw new Error('cannot set property with undefined metadata');
    }
    instance.__metadata.properties[name].value = value;
  }

  /**
   * Constructs a new Instance of the Class, allowing a handler to be executed before returning the instance;
   * 
   * @static
   * @param {string} name - class name
   * @param {function()} fn - handler 
   * @param {*} ...args
   * @returns {Class}
   */
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