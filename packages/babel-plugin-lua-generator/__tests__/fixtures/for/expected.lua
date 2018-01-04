for i = 0, 10 do
  print(i)
end

for i = 10, 0, -1 do
  print(i)
end

local i = 10
while i >= 0 do
  print(i)
  i = i + 1
end

for i = 0, 10 do
  print(i)
end

for i = 0, 10, -1 do
  print(i)
end

local i = 0
while i < 10 do
  print(i)
  i = i + math.random()
end

while true do
  print(i)
end

for k in pairs(obj) do
  print(k, obj[k])
end

for k in pairs(obj) do
  print(k, obj[k])
end
