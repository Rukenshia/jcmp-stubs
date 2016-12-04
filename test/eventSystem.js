'use strict';

const { expect } = require('chai');
const { EventSystem } = require('../eventSystem.js');
const { ClassBuilder } = require('../classBuilder.js');

describe('Event System', () => {
  let ev;
  global.log.config({ level: 5 });
  const cb = new ClassBuilder();

  describe('constructing a new EventSystem', () => {
    ev =  new EventSystem(cb, []);
    expect(ev).to.be.an.instanceof(EventSystem);

    it('has no events registered', () => {
      expect(ev._events.size).to.equal(0);
    });
    it('has no remote events registered', () => {
      expect(ev._remoteEvents.size).to.equal(0);
    });
  });

  describe('adding events', () => {
    it('can add an event', () => {
      ev.Add('_test_add_event1', () => true);
      expect(ev._events.has('_test_add_event1')).to.be.true;
    });

    it('can add an remote event', () => {
      ev.AddRemoteCallable('_test_add_remote_event1', () => true);
      expect(ev._remoteEvents.has('_test_add_remote_event1')).to.be.true;
    });
    
    it('does not add remote events to normal events', () => {
      expect(ev._events.has('_test_add_remote_event1')).to.be.false;
    });
    
    it('does not add events to remote events', () => {
      expect(ev._remoteEvents.has('_test_add_event1')).to.be.false;
    });
  });

  describe('calling events', () => {
    describe('package-wide events', () => {
      it('can call an event', () => {
        const retn = ev.Call('_test_add_event1');
        expect(retn).to.have.lengthOf(1);
        expect(retn[0]).to.be.true;
      });

      it('can call an event with arguments', () => {
        const retn = ev.Call('_test_add_event1', 1, { x: 'y' }, 'gomenasai');
        expect(retn).to.have.lengthOf(1);
        expect(retn[0]).to.be.true;
      });

      it('can call multiple event handlers', () => {
        ev.Add('_test_multi_event', () => 1);
        ev.Add('_test_multi_event', () => 2);
        const retn = ev.Call('_test_multi_event', 1, { x: 'y' }, 'gomenasai');
        expect(retn).to.have.lengthOf(2);
        expect(retn[0]).to.equal(1);
        expect(retn[1]).to.equal(2);
      });

      it('can return arguments', () => {
        ev.Add('_test_events_with_args', (...a) => {
          return a;
        });

        const args = [0, 'gomenasai', [1, 2, 3], { x: 'y' }];
        const retns = ev.Call('_test_events_with_args', ...args);
        expect(retns).to.have.lengthOf(1);
        expect(retns[0]).to.be.an.instanceof(Array);
        const retn = retns[0];
        args.forEach((arg, idx) => {
          expect(retn[idx]).to.equal(arg);
        })
      })
    });

    describe('remote events', () => {
      it('can call an event', () => {
        ev.CallRemote('_test_add_remote_event1');
      });

      it('can call an event with arguments', () => {
        ev.CallRemote('_test_add_remote_event1', 1, { x: 'y' }, 'gomenasai');
      });

      it('does not call remote events registered server-side', () => {
        const retn = ev.CallRemote('_test_add_remote_event1');
        expect(retn).to.be.a('undefined');
      });
    });
  });
});