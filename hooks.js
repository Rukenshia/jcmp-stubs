'use strict';

module.exports = {
  Player: { 
    Respawn() {
      events.fakeCall('PlayerRespawn', this);
    },
    Kick() {
      events.fakeCall('PlayerDestroyed', this);
      events.fakeCall('ClientDisconnected', this.client);
      this.__metadata.destroyed = true;
      jcmp.players.splice(jcmp.players.indexOf(player), 1);
    }
  },
};
