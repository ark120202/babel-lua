local String = { prototype = {} }

String.fromCharCode = string.char
String.fromCodePoint = nil

String.prototype = {}

String.prototype.length = nil
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

String.raw = nil

-- busted uses these
if _TESTING then
	String.prototype.match = string.match
	String.prototype.sub = string.sub
	String.prototype.find = string.find
	String.prototype.lower = string.lower
	String.prototype.gmatch = string.gmatch
	String.prototype.format = string.format
	String.prototype.gsub = string.gsub
	String.prototype.len = string.len
end

return String
