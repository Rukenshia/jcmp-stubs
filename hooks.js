'use strict';

const { ClassHelper } = require('./classHelper');

function removeFromGlobalArray(arrayName, obj) {
  jcmp[arrayName].splice(jcmp[arrayName].indexOf(obj), 1);
}

module.exports = {
  Player: { 
    Respawn() {
      events.fakeCall('PlayerRespawn', this);
    },
    GiveWeapon(hash, ammo, equip) {
      const weapon = ClassHelper.build('PlayerWeapon', ({ set }) => {
        set('modelHash', hash);
        set('reserveAmmo', ammo);
      });

      if (equip) {
        ClassHelper.setPropertyUnchecked(this, 'selectedWeapon', weapon);
      }

      ClassHelper.setPropertyUnchecked(this, 'weapons', [weapon]);
      return weapon;
    },
    Kick() {
      events.fakeCall('PlayerDestroyed', this);
      events.fakeCall('ClientDisconnected', this.client);
      this.__metadata.destroyed = true;
      removeFromGlobalArray('players', this);
    }
  },
  Vehicle: {
    Destroy() {
      removeFromGlobalArray('vehicles', this);
      events.fakeCall('VehicleDestroyed', this);
    }
  },
  Checkpoint: {
    Destroy() {
      removeFromGlobalArray('checkpoints', this);
    }
  },
  POI: {
    Destroy() {
      removeFromGlobalArray('poi', this);
    }
  },
  GameObject: {
    Destroy() {
      removeFromGlobalArray('objects', this);}
  }
};
