'use strict';

function vectorConstructor(v, ...args) {
  v.x = args[0];
  v.y = args[1],
  v.z = args[2];
}

const constructors = {
  Vector3f: function(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; },
  Vector3: function(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; },
  Vector2f: function(x = 0, y = 0) { this.x = x; this.y = y; },
  Vector2: function(x = 0, y = 0) { this.x = x; this.y = y; },
  Vector4f: function(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; },
  Vector4: function(x = 0, y = 0, z = 0, w = 0) { this.x = x; this.y = y; this.z = z; this.w = w; },
}

module.exports = constructors;