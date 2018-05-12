_G.Function = { prototype = {} }

local unpack = unpack or table.unpack

function Function.prototype.apply(self, this, args)
  return self.__js and self(this, unpack(args)) or self(unpack(args))
end

function Function.prototype.call(self, this, ...)
  return self.__js and self(this, ...) or self(...)
end

function Function.prototype.bind(self, this, ...)
  local isJs = self.__js
  local baseArgs = {...}
  local baseLen = #baseArgs
  if baseLen == 0 then
    return function(...)
      return isJs and self(this, ...) or self(...)
    end
  end

  return function(...)
    local args = {}
    local callArgs = {...}

    for i = 1, baseLen do
      args[i] = baseArgs[i]
    end
    for i = 1, #callArgs do
      args[baseLen + i] = callArgs[i]
    end

    return isJs and self(this, unpack(args)) or self(unpack(args))
  end
end
