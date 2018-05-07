export default function _wrapFunction(f) {
  f.__js = true;
  return f;
}
