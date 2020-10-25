function Promise(self, executor)
  if self.constructor ~= Promise then
    error("undefined is not a promise")
  end
  if type(executor) ~= "function" then
    error("Promise resolver is not a function")
  end
  local resolve, reject = nil
  executor:call(nil, resolve, reject)
end
Promise.__js = true

Promise.prototype['then'] = function(self, onFulfilled, onRejected)

end
