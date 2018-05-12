Infinity = math.huge
NaN = 0 / 0

function isNaN(x)
  return x ~= x
end

function isFinite(x)
  return x ~= Infinity and x ~= -Infinity
end
