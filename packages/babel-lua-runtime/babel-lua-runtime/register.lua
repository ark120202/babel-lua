local Function = require("babel-lua-runtime.builtins.function")
local functionCache = {}
debug.setmetatable(function() end, {
	__index = function(self, index)
		if functionCache[self] == nil or functionCache[self][index] == nil then
			return Function.prototype[index]
		else
			return functionCache[self][index]
		end
	end,

	__newindex = function(self, k, v)
		if functionCache[self] == nil then
			functionCache[self] = {}
		end
		functionCache[self][k] = v
	end,
})

local String = require("babel-lua-runtime.builtins.string")
debug.setmetatable("", {
	__add = function(self, str) return self .. str end,
  __index = function(self, index) return String.prototype[index] end,
  __newindex = function() end,
})
