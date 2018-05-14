_G.String = { prototype = {} }

String.fromCharCode = string.char
String.fromCodePoint = nil
String.raw = nil

String.prototype.constructor = nil
String.prototype.anchor = nil
String.prototype.big = nil
String.prototype.blink = nil
String.prototype.bold = nil
String.prototype.charAt = nil
String.prototype.charCodeAt = nil
String.prototype.codePointAt = nil
String.prototype.concat = nil
String.prototype.endsWith = nil
String.prototype.fontcolor = nil
String.prototype.fontsize = nil
String.prototype.fixed = nil
String.prototype.includes = nil
String.prototype.indexOf = nil
String.prototype.italics = nil
String.prototype.lastIndexOf = nil
String.prototype.link = nil
String.prototype.localeCompare = nil
String.prototype.normalize = nil
String.prototype["repeat"] = nil
String.prototype.replace = nil
String.prototype.slice = nil
String.prototype.small = nil
String.prototype.split = nil
String.prototype.strike = nil
String.prototype.sub = nil
String.prototype.substr = nil
String.prototype.substring = nil
String.prototype.sup = nil
String.prototype.startsWith = nil
String.prototype.toString = nil
String.prototype.trim = nil
String.prototype.trimLeft = nil
String.prototype.trimRight = nil
String.prototype.toLowerCase = nil
String.prototype.toUpperCase = nil
String.prototype.valueOf = nil
String.prototype.match = nil
String.prototype.search = nil
String.prototype.padStart = nil
String.prototype.padEnd = nil
String.prototype.toLocaleLowerCase = nil
String.prototype.toLocaleUpperCase = nil
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
