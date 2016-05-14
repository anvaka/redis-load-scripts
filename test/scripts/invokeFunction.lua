local invoker = {}

function invoker.run(callback, arg)
  print("running callback")
  callback(arg)
end

return invoker
