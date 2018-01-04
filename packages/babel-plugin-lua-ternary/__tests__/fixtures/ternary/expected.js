function _iif(condition, t, f) { if (condition) { return type(t) == 'function' && t() || t; } else { return type(f) == 'function' && f() || f; } }

_iif(test, true, false);

_iif(test, () => foo(), () => bar());