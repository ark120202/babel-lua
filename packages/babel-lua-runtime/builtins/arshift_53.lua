function Reflect:__arshift(a, b)
  a = a & 0xFFFFFFFF
  if b <= 0 or (a & 0x80000000) == 0 then
    return (a >> b) & 0xFFFFFFFF
  else
    return ((a >> b) | ~(0xFFFFFFFF >> b)) & 0xFFFFFFFF
  end
end
