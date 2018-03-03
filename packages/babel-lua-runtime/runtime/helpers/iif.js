export default function iif(condition, t, f) {
  if (condition) {
    return type(t) == 'function' && t() || t
  } else {
    return type(f) == 'function' && f() || f
  }
}
