_G.Function = {prototype = {}}

local unpack = unpack or table.unpack

function Function.prototype.apply(self, this, args)
  if self.__js then
    return self(this, unpack(args))
  else
    return self(unpack(args))
  end
end

function Function.prototype.call(self, this, ...)
  if self.__js then
    return self(this, ...)
  else
    return self(...)
  end
end

function Function.prototype.bind(self, this, ...)
  local isJs = self.__js
  local baseArgs = {...}
  local baseLen = #baseArgs
  if baseLen == 0 then
    return function(...)
      if isJs then
        return self(this, ...)
      else
        return self(...)
      end
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

    if isJs then
      return self(this, unpack(args))
    else
      return self(unpack(args))
    end
  end
end

local functionCache = {}

local functionProto = Function.prototype
debug.setmetatable(
  function()
  end,
  {
    __index = function(self, index)
      if functionCache[self] == nil or functionCache[self][index] == nil then
        if index == "prototype" then
          local proto = {}
          self.prototype = proto
          return proto
        end
        return functionProto[index]
      else
        return functionCache[self][index]
      end
    end,
    __newindex = function(self, key, value)
      if functionCache[self] == nil then
        functionCache[self] = {}
      end
      functionCache[self][key] = value
    end
  }
)
