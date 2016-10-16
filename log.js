'use strict';

global.log = module.exports = require('custom-logger').new({
  debug: { color: 'grey', level: 0, event: 'debug' },
  pstub: { color: 'cyan', level: 1, event: 'property' },
  fstub: { color: 'magenta', level: 2, event: 'function' },
  event: { color: 'blue', level: 3, event: 'event' },
  info: { color: 'green', level: 4, event: 'info' },
  warn: { color: 'yellow', level: 5, event: 'warning' },
  error: { color: 'red', level: 6, event: 'ERROR' },
}).config({ level: 0 });