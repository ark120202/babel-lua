function Set(self, iterable)
  self.elements = {}
  if not iterable then
    return
  end
  for _, v in Reflect:__forOf(iterable) do
    self.elements[v] = true
  end
end
Set.__js = true

function Set.prototype:add(value)
  self.elements[value] = true
end

function Set.prototype:clear()
  self.elements = {}
end

function Set.prototype:delete(value)
  self.elements[value] = nil
end

function Set.prototype:entries()
  local v = next(self.elements, nil)
  return {
    next = function()
      local pv = v
      v = next(self.elements, value)

      return {
        value = Reflect:__new(Array, pv, pv),
        done = pv == nil
      }
    end
  }
end

function Set.prototype:forEach(callback)
  for _, v in pairs(self.elements) do
    callback:call(nil, v, v, self)
  end
end

function Set.prototype:has(value)
  return self.elements[value] == true
end

function Set.prototype:values()
  local v = next(self.elements, nil)
  return {
    next = function()
      local pv = v
      v = next(self.elements, value)

      return {
        value = pv,
        done = pv == nil
      }
    end
  }
end
Set.prototype.keys = Set.prototype.values
Set.prototype[Symbol.iterator] = Set.prototype.values
