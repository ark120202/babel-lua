_G.console = {}

function console:log(...)
  print(...)
end

function console:trace(message)
  local stack = debug.traceback(message == nil and "console.trace" or message, 2)
  stack = string.gsub(stack, "\n[^\n]*", "", 1)
  print(stack)
end
