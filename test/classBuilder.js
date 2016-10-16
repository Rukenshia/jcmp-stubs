'use strict';

const { expect } = require('chai');
const { ClassBuilder } = require('../classBuilder.js');

describe('Class Builder', () => {
  global.log.config({ level: 5 });

  describe('constructing empty', () => {
    const cb = new ClassBuilder();

    it('has only the Entity class', () => {
      expect(cb._classes.size).to.equal(1);
      expect(cb._classes.has('Entity')).to.be.true;
    });
  });

  describe('with dummy object', () => {
    const dummies = require('./dummyClasses.json');
    const cb = ClassBuilder.fromDataObject(dummies);

    it('has as many classes as dummyObjects provides (+1)', () => {
      expect(cb._classes.size).to.equal(dummies.length + 1);
    });

    dummies.forEach(dummy => {
      describe(`Dummy Class '${dummy.name}'`, () => {
        const cls = cb.getClass(dummy.name);
        it('exists', () => {
          expect(cls).to.be.a('function');
        });
        const proto = cls.prototype;
        
        if (!dummy.isAutoDestroy) {
          it('has the .Destroy function', () => expect(proto.Destroy).to.be.a('function'));
        }

        dummy.functions.forEach(fn => {
          it(`has function '${fn.name}'`, () => expect(proto[fn.name]).to.be.a('function'));
        });
        dummy.functions.forEach(prop => {
          it(`has property '${prop.name}'`, () => expect(proto[prop.name]).to.not.be.undefined);
        });
      });
    });
  })
});