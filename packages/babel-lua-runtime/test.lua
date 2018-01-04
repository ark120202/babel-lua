_G._TESTING = true
require("babel-lua-runtime.register")

describe("prototypes", function()
	it("should make functions object-like", function()
      assert.has_no.errors(function()
        (function() end).value = true
      end)

      local foo = (function() end)
      pcall(function() foo.value = true end)
      assert.are.equals(foo.value, true)
  end)

	it("should make strings object-like", function()
      assert.has_no.errors(function()
        ("").value = true
      end)

      local foo = ""
      pcall(function() foo.value = true end)
      assert.are.equals(foo.value, nil)
	end)
end)
