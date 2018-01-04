const path = require('path');

module.exports.directory = path.join(__dirname, 'src');
module.exports.glob = path.join(module.exports, '**/*.lua');
