const _exports = {};

const _module = require('module');

for (let k in _module) {
  if (k === 'default') continue;
  _exports[k] = _module[k];
}

return _exports;
