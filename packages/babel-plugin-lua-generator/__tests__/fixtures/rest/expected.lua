local function foo(...)
  local args = { ... }
  print(table.unpack(args))
end
