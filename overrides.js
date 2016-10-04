'use strict';

const { ClassHelper } = require('./classHelper');

const constructors = {
  Vector3f: function(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; },
  Vector3: function(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; },
  Vector2f: function(x = 0, y = 0) { this.x = x; this.y = y; },
  Vector2: function(x = 0, y = 0) { this.x = x; this.y = y; },
  Vector4f: function(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; },
  Vector4: function(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; },
  RGB: function(r = 0, g = 0, b = 0) { this.r = r; this.g = g; this.b = b; },
  RGBA: function(r = 0, g = 0, b = 0, a = 0) { this.r = r; this.g = g; this.b = b; this.a = a; },
};

constructors.Player = function() { ClassHelper.setPropertyUnchecked(this, 'vehicle', null); };
constructors.Vehicle = function(hash, pos = new Vector3(), rot = new Vector3()) { this.modelHash = hash; this.position = pos; this.rotation = rot };
constructors.Checkpoint = function(hash, pos = new Vector3(), rot = new Vector3()) { this.modelHash = hash; this.position = pos; this.rotation = rot };
constructors.GameObject = function(hash, pos = new Vector3(), rot = new Vector3()) { this.model = hash; this.position = pos; this.rotation = rot };
constructors.POI = function(type, pos = new Vector3(), rot = new Vector3()) { this.type = type; this.position = pos; this.rotation = rot };

module.exports = {
  constructors,
  similarClasses: {
    Vector3f: ['Vector3'],
    Vector3: ['Vector3f'],
    Vector2f: ['Vector2'],
    Vector2: ['Vector2f'],
    Vector4f: ['Vector4'],
    Vector4: ['Vector4f'],
  }
};