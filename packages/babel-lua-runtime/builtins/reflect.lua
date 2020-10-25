_G.Reflect = {}

function Reflect:__iif(condition, t, f)
  if condition then
    return t
  else
    return f
  end
end

function Reflect:__typeof(o)
  if o == nil then
    return "undefined"
  end

  local t = type(o)
  if t == "table" then
    return o.constructor == Symbol and "symbol" or "object"
  end
  return t
end

function Reflect:__markFunction(f)
  f.__js = true
  return f
end

function Reflect:__wrapGenerator(f)
  return function()
    local c = coroutine.create(f)
    return {
      next = function(_, arg)
        local status, value = coroutine.resume(c, arg)
        if not status then
          return {done = true}
        end

        return {
          value = value,
          done = coroutine.status(c) == "dead"
        }
      end,
      throw = function(_, arg)
        local status, value = coroutine.resume(c, {__error = arg})
        if not status then
          error(value)
        end

        return {
          value = value,
          done = coroutine.status(c) == "dead"
        }
      end,
      ["return"] = function()
        error("generator.return is not supported")
      end,
      -- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#Is_a_generator_object_an_iterator_or_an_iterable
      [Symbol.iterator] = function(self)
        return self
      end
    }
  end
end

function Reflect:__yield(...)
  local result = coroutine.yield(...)
  if type(result) == "table" and result.__error then
    error(result.__error)
  end

  return result
end

function Reflect:__forOf(iterator)
  if iterator[Symbol.iterator] then
    iterator = iterator[Symbol.iterator](iterator)

    if iterator.next == nil then
      error("Result of the Symbol.iterator method is not an iterable")
    end
  elseif iterator.next == nil then
    error("for..of argument is not iterable")
  end

  return function()
    local result = iterator.next()
    -- Lua stops iteration once iterator returns nil as first value, so return actual value second
    return result.done and nil, result.value
  end
end

Reflect.TryNil = {}
function Reflect:__try(try, catch, finally)
  local returns
  local status, err = pcall(try)

  if status then
    returns = err
  end

  if not status and catch then
    status = true
    returns = catch:call(nil, err)
  end

  if finally then
    local finalReturns = finally();
    if finalReturns ~= nil then
      returns = finalReturns
    end
  end

  if not status then
    error(err)
  end

  return returns
end

function Reflect:__computed(obj, property, ...)
  return obj[property](obj, ...)
end

local unpack = unpack or table.unpack
function Reflect:unpack(target)
  return unpack(target, 1, table.maxn(target))
end

function Reflect:__unpackIterable(arrayLike)
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

  return Reflect:unpack(target)
end

function Reflect:__new(subClass, ...)
  local proto = subClass.prototype
  local mt
  mt = {
    _getters = {},
    _setters = {},
    __index = function(self, key)
      local inSelf = rawget(self, key)
      if inSelf ~= nil then
        return inSelf
      else
        local getter = mt._getters[key]
        if getter ~= nil then
          return getter(self)
        else
          return proto[key]
        end
      end
    end,
    __newindex = function(self, key, value)
      local setter = mt._setters[key]
      if setter ~= nil then
        setter(self, value)
      else
        rawset(self, key, value)
      end
    end
  }

  local instance = setmetatable({}, mt)
  instance.constructor = subClass
  instance = subClass:call(instance, ...) or instance
  return instance
end

local function noop()
end

function Reflect:__makeConstructor(subClass, constructor, superClass)
  constructor = constructor or noop
  subClass.__super = superClass

  local mt = getmetatable(subClass) or {}
  mt.__call = constructor
  return setmetatable(subClass, mt)
end

function Reflect:__instanceof(self, c)
  local m = self.constructor
  while m do
    if m == c then
      return true
    end
    m = m.__super
  end
  return false
end

function Reflect:__assertThisInitialized(self)
  if self == nil then
    error("this hasn't been initialised - super() hasn't been called")
  end
  return self
end

function Reflect:__inherits(subClass, superClass)
  for k, v in pairs(superClass.prototype) do
    subClass.prototype[k] = v
  end
  setmetatable(subClass, {__index = superClass})
end
