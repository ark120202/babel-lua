local knownSymbols = {}

function Symbol(this, name)
  if this ~= nil then
    error("Symbol is not a constructor")
  end

  local fullName = "Symbol(" .. name .. ")"
  return {
    constructor = Symbol,
    toString = function()
      return fullName
    end
  }
end
Symbol.__js = true

Symbol["for"] = function(_, name)
  if knownSymbols[name] then
    return knownSymbols[name]
  else
    local symbol = Symbol(nil, name)
    knownSymbols[name] = symbol
    return symbol
  end
end

Symbol.iterator = Symbol(nil, "Symbol.iterator")
