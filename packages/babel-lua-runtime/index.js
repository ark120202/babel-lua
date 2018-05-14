_G.global = _G;
import './builtins/function';
import './builtins/string';
import './builtins/globals';
import './builtins/math';
import './builtins/reflect';
if (_VERSION === 'Lua 5.3') require('./builtins/arshift_53');
