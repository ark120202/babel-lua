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
    return t.constructor == Symbol and "symbol" or "object"
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
