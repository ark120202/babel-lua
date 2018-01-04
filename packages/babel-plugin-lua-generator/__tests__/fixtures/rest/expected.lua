local function foo(...)
  local args = { ... }
  console.log(table.unpack(args))
end
