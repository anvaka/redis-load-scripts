local invokeFunction = require('invokeFunction')
local hello = require('sayHi')

invokeFunction.run(hello, 'world')
