function Array(self, ...)
  local args = {...}
  local max = select('#', ...)
  self.length = max

  for i = 1, max do
    self[i - 1] = args[i]
  end
end
Array.__js = true

function Array:from(arrayLike, mapFn)
  if arrayLike[Symbol.iterator] then
    arrayLike = arrayLike[Symbol.iterator](arrayLike)

    if arrayLike == nil or arrayLike.next == nil then
      error("Result of the Symbol.iterator method is not an iterable")
    end
  elseif arrayLike.next == nil then
    error("Array.from argument is not iterable")
  end

  local target = {}
  while true do
    local result = arrayLike.next()
    if result.done then
      break
    end
    if mapFn then
      result.value = mapFn(result.value)
    end
    table.insert(target, result.value)
  end

  return Reflect:__new(Array, Reflect:unpack(target))
end

Array.prototype[Symbol.iterator] = function(self)
  local i = -1
  return {
    next = function()
      i = i + 1

      return {
        value = self[i],
        done = i >= self.length
      }
    end
  }
end

function Array.prototype:forEach(callback)
  for i = 0, self.length - 1 do
    callback:call(nil, self[i], i, self)
  end
end

function Array.prototype:map(callback)
  local target = {}

  for i = 0, self.length - 1 do
    target[i + 1] = callback:call(nil, self[i], i, self)
  end

  return Reflect:__new(Array, Reflect:unpack(target))
end

function Array.prototype:filter(callback)
  local target = {}
  local n = 1

  for i = 0, self.length - 1 do
    if callback:call(nil, self[i], i, self) then
      target[n] = self[i]
      n = n + 1
    end
  end
  return Reflect:__new(Array, Reflect:unpack(target))
end

function Array.prototype:reduce(callback, initialValue)
  for i = 0, self.length - 1 do
    initialValue = callback:call(nil, initialValue, self[i], i, self)
  end

  return initialValue
end

function Array.prototype:every(callback)
  for i = 0, self.length - 1 do
    if not callback:call(nil, self[i], i, self) then
      return false
    end
  end

  return true
end

function Array.prototype:some(callback)
  for i = 0, self.length - 1 do
    if callback:call(nil, self[i], i, self) then
      return true
    end
  end

  return false
end

function Array.prototype:indexOf(value)
  for i = 0, self.length - 1 do
    if self[i] == value then
      return i
    end
  end

  return -1
end

function Array.prototype:includes(value)
  for i = 0, self.length - 1 do
    if self[i] == value then
      return true
    end
  end

  return false
end

function Array.prototype:unshift(...)
  for k, v in pairs({...}) do
    table.insert(self, k - 1, v)
    self.length = self.length + 1
  end
end

local function shiftArrayElements(self, at, by)
  for i = at, self.length - 1 do
    self[i] = self[i + by]
  end
end

function Array.prototype:fill(value, start, endn)
  for i = (start or 0), (endn or self.length) do
    self[i] = value
  end

  return self
end

function Array.prototype:pop()
  self.length = self.length - 1
  local element = self[self.length]
  self[self.length] = nil

  return element
end

function Array.prototype:push(...)
  for _, v in pairs({...}) do
    self[self.length] = v
    self.length = self.length + 1
  end

  return self.length
end

function Array.prototype:reverse()
  local i, j = 0, self.length - 1

  while i < j do
    self[i], self[j] = self[j], self[i]

    i = i + 1
    j = j - 1
  end

  return self
end

function Array.prototype:shift()
  local element = self[0]
  shiftArrayElements(self, 0, 1)
  self.length = self.length - 1
  return element
end

-- function Array.prototype:splice(start, deleteCount, ...)
--   local items = {...}
--   local itemsN = table.maxn(items)

--   local offset = itemsN - (deleteCount or 0)
--   for i = start, self.length do
--     self[i] = self[i + offset]
--   end
-- end
