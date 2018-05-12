_G.Reflect = {}

function Reflect:__iif(condition, t, f)
  local value
  if condition then
    value = t
  else
    value = f
  end

  if type(value) == "function" then
    return value()
  else
    return value
  end
end

function Reflect:__typeof(o)
  local t = type(o)
  return t == "table" and "object" or t
end

function Reflect:__markFunction(f)
  f.__js = true
  return f
end

function Reflect:__wrapGenerator()
  return function()
    local c = coroutine.create(f)
    return {
      next = function(_, arg)
        local status, value = coroutine.resume(c, arg)
        if not status then
          return {done = true}
        else
          return {
            value = value,
            done = coroutine.status(c) == "dead"
          }
        end
      end,
      throw = function()
        error("generator.throw is not supported")
      end,
      ["return"] = function()
        error("generator.return is not supported")
      end
    }
  end
end
