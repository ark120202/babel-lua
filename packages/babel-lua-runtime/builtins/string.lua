_G.String = {prototype = {}}

String.fromCharCode = string.char
String.fromCodePoint = string.char
String.raw = nil

String.prototype[Symbol.iterator] = function(self)
  local i = -1
  return {
    next = function()
      i = i + 1
      return {
        value = self[i],
        done = self[i] == nil
      }
    end
  }
end

String.prototype.constructor = nil
String.prototype.anchor = nil
String.prototype.big = nil
String.prototype.blink = nil
String.prototype.bold = nil
String.prototype.charAt = nil
String.prototype.charCodeAt = nil
String.prototype.codePointAt = nil
String.prototype.concat = nil

function String.prototype:endsWith(searchString, length)
  if searchString == "" then
    return true
  end

  if length ~= nil then
    return string.sub(self, length - string.len(searchString) + 1, length) == searchString
  else
    return string.sub(self, -string.len(searchString)) == searchString
  end
end

String.prototype.fontcolor = nil
String.prototype.fontsize = nil
String.prototype.fixed = nil

function String.prototype:includes(value)
  return string.find(self, value, 1, true) ~= nil
end

function String.prototype:indexOf(value)
  local v = string.find(self, value, 1, true)
  return v or -1
end

String.prototype.italics = nil
String.prototype.lastIndexOf = nil
String.prototype.link = nil
String.prototype.localeCompare = nil
String.prototype.normalize = nil

String.prototype["repeat"] = string.rep

String.prototype.replace = nil
String.prototype.slice = nil
String.prototype.small = nil
String.prototype.split = nil
String.prototype.strike = nil
String.prototype.sub = nil
String.prototype.substr = nil
String.prototype.substring = nil
String.prototype.sup = nil

function String.prototype:startsWith(searchString, position)
  return string.sub(self, (position or 0) + 1, string.len(searchString) + (position or 0)) == searchString
end

String.prototype.toString = nil

function String.prototype:trim()
  local v = string.gsub(self, "^%s*(.-)%s*$", "%1")
  return v
end

function String.prototype:trimLeft()
  local v = string.gsub(self, "^%s*", "")
  return v
end

function String.prototype:trimRight()
  local n = #self
  while n > 0 and string.find(self, "^%s", n) do
    n = n - 1
  end
  return string.sub(self, 1, n)
end

String.prototype.toLowerCase = string.lower
String.prototype.toUpperCase = string.upper
String.prototype.valueOf = nil
String.prototype.match = nil
String.prototype.search = nil
String.prototype.padStart = nil
String.prototype.padEnd = nil
String.prototype.toLocaleLowerCase = string.lower
String.prototype.toLocaleUpperCase = string.upper

local stringProto = String.prototype
debug.setmetatable(
  "",
  {
    __add = function(self, str)
      return self .. str
    end,
    __index = function(self, index)
      if type(index) == "number" then
        return index + 1 <= #self and string.sub(self, index + 1, index + 1) or nil
      elseif index == "length" then
        return string.len(self)
      else
        return stringProto[index]
      end
    end,
    __newindex = function()
    end
  }
)
