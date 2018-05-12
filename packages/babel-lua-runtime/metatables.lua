local functionCache = {}

local functionProto = Function.prototype
debug.setmetatable(function() end, {
  __index = function (self, index)
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
  end,
})

local stringProto = String.prototype
debug.setmetatable('', {
  __add = function(self, str)
    return self .. str
  end,
  __index = function(_, index)
    return stringProto[index]
  end,
  __newindex = function() end,
})
