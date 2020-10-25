local descriptorMt = {
  __index = function(self, key)
  end
}

local function applyDescriptorsMt(obj)
  local oldMt = getmetatable(obj)
  if oldMt then
    if oldMt._descriptors then
      return oldMt
    end
    error("Can't apply descriptor to object with invalid metatable")
  end

  local mt = Object:assign({}, descriptorMt)
  mt._descriptors = {}
  setmetatable(obj, mt)
  return mt
end

local function validateDescriptor(descriptor)
  if type(descriptor) ~= "object" then
    error()
  end
end

function Object:getOwnPropertyDescriptor(obj, property)
  local mt = getmetatable(obj) or {}
  return (mt._descriptors or {})[property]
end

function Object:getOwnPropertyDescriptors(obj)
  local mt = getmetatable(obj) or {}
  return Object:assign({}, mt._descriptors or {})
end

function Object:defineProperty(obj, prop, descriptor)
  local mt = applyDescriptorsMt(obj)
  validateDescriptor(descriptor)
  mt._descriptors[prop] = descriptor
end

function Object:defineProperties(obj, descriptors)
  local mt = applyDescriptorsMt(obj)
  for k, v in pairs(descriptors) do
    validateDescriptor(v)
    mt._descriptors[k] = v
  end
end
