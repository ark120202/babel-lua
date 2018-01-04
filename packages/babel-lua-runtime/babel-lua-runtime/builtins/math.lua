local Math = {}

Math.abs = math.abs
Math.acos = math.acos
Math.acosh = nil
Math.asin = math.asin
Math.asinh = nil
Math.atan = math.atan
Math.atanh = nil
Math.atan2 = nil
Math.ceil = math.ceil
Math.cbrt = nil
Math.expm1 = nil
Math.clz32 = nil
Math.cos = math.cos
Math.cosh = nil
Math.exp = nil
Math.floor = math.floor
Math.fround = nil
Math.hypot = nil
Math.imul = nil
Math.log = math.log
Math.log1p = nil
Math.log2 = nil
Math.log10 = math.log10
Math.max = math.max
Math.min = math.min
Math.pow = math.pow
Math.random = math.random
Math.round = nil --[[ function (x)
	return x % 2 ~= 0.5 and x - 0.5 or math.floor(x + 0.5)
end ]]
Math.sign = function (x)
	x = TypeLib.number(x)
	if x == 0 or TypeLib.isNaN(x) then
		return x
	end
	return x > 0 and 1 or -1
end
Math.sin = math.sin
Math.sinh = math.sinh
Math.sqrt = math.sqrt
Math.tan = math.tan
Math.tanh = math.tanh
Math.trunc = nil
Math.E = 2.718281828459045
Math.LN10 = nil
Math.LN2 = nil
Math.LOG10E = nil
Math.LOG2E = nil
Math.PI = math.pi
Math.SQRT1_2 = nil
Math.SQRT2 = nil

return Math
