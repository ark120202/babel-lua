_G.Math = {}

local function pipe(func)
  return function(_, ...)
    return func(...)
  end
end

Math.abs = pipe(math.abs)
Math.acos = pipe(math.acos)
Math.acosh = nil
Math.asin = pipe(math.asin)
Math.asinh = nil
Math.atan = pipe(math.atan)
Math.atanh = nil
Math.atan2 = nil
Math.ceil = pipe(math.ceil)
Math.cbrt = nil
Math.expm1 = nil
Math.clz32 = nil
Math.cos = pipe(math.cos)
Math.cosh = nil
Math.exp = nil
Math.floor = pipe(math.floor)
Math.fround = nil
Math.hypot = nil
Math.imul = nil
Math.log = pipe(math.log)
Math.log1p = nil
Math.log2 = nil
Math.log10 = pipe(math.log10)
Math.max = pipe(math.max)
Math.min = pipe(math.min)
Math.pow = pipe(math.pow)
Math.random = pipe(math.random)
function Math:round(x)
  if x >= 0 then
    return math.floor(x + 0.5)
  else
    return math.ceil(x - 0.5)
  end
end
function Math:sign(x)
  if x == 0 or isNaN(x) then
    return x
  end
  return x > 0 and 1 or -1
end
Math.sin = pipe(math.sin)
Math.sinh = pipe(math.sinh)
Math.sqrt = pipe(math.sqrt)
Math.tan = pipe(math.tan)
Math.tanh = pipe(math.tanh)
Math.trunc = nil
Math.E = 2.718281828459045
Math.LN10 = math.log(10)
Math.LN2 = math.log(2)
Math.LOG10E = math.log(Math.E)
Math.LOG2E = nil -- Math:log2(Math.E)
Math.PI = math.pi
Math.SQRT1_2 = math.sqrt(1 / 2)
Math.SQRT2 = math.sqrt(2)

return Math
