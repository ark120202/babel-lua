_G.Object = {}

function Object:assign(target, ...)
  for _, source in ipairs({...}) do
    for k, v in pairs(source) do
      target[k] = v
    end
  end

  return target
end

function Object:keys(obj)
  local target = {}
  for k in pairs(obj) do
    table.insert(target, k)
  end

  return Reflect:__new(Array, unpack(target))
end

function Object:values(obj)
  local target = {}
  for _, v in pairs(obj) do
    table.insert(target, v)
  end

  return Reflect:__new(Array, unpack(target))
end

function Object:entries(obj)
  local target = {}
  for k, v in pairs(obj) do
    table.insert(target, Reflect:__new(Array, k, v))
  end

  return Reflect:__new(Array, unpack(target))
end

