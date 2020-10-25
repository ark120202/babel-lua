function Map(self, iterable)
  self.elements = {}
  if not iterable then
    return
  end
  for _, v in Reflect:__forOf(iterable) do
    self.elements[v[0]] = v[1]
  end
end
Map.__js = true

function Map.prototype:clear()
  self.elements = {}
end

function Map.prototype:delete(key)
  local had = self.elements[key] ~= nil
  self.elements[key] = nil
  return had
end

function Map.prototype:entries()
  local k, v = next(self.elements, nil)
  return {
    next = function()
      local pk, pv = k, v
      k, v = next(self.elements, k)

      return {
        value = Reflect:__new(Array, pk, pv),
        done = pk == nil
      }
    end
  }
end

function Map.prototype:forEach(callback)
  for k, v in pairs(self.elements) do
    callback:call(nil, v, k, self)
  end
end

function Map.prototype:get(key)
  return self.elements[key]
end

function Map.prototype:has(key)
  return self.elements[key] ~= nil
end

function Map.prototype:keys()
  local k = next(self.elements, nil)
  return {
    next = function()
      local pk = k
      k = next(self.elements, k)

      return {
        value = pk,
        done = pk == nil
      }
    end
  }
end

function Map.prototype:set(key, value)
  self.elements[key] = value
  return self
end

function Map.prototype:values()
  local k, v = next(self.elements, nil)
  return {
    next = function()
      local pv = v
      k, v = next(self.elements, k)

      return {
        value = pv,
        done = pv == nil
      }
    end
  }
end
Map.prototype[Symbol.iterator] = Map.prototype.entries
