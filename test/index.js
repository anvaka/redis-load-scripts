var test = require('tap').test;
var loadScripts = require('../');
var path = require('path');
var resolve = require('../lib/resolve.js');

var luaPathConfig = path.join(__dirname, 'scripts');

test('it replaces require with function', function(t) {
  var compiled = loadScripts('main', luaPathConfig);

/* The code above will be compiled to
local _REDIS_SCRIPT = {}
_REDIS_SCRIPT["main"] = function()
local sayHi = _REDIS_SCRIPT["sayHi"]()
sayHi('world')

end

_REDIS_SCRIPT["sayHi"] = function()
return function(who)
  print('main ' .. who)
end

end

return _REDIS_SCRIPT["main"]()
*/

  t.ok(compiled.indexOf('local _REDIS_SCRIPT = {}') >= 0, 'global scripts are stored in the table')
  t.ok(compiled.indexOf('_REDIS_SCRIPT["main"] = function()') > 0, 'require("sayHi") is replaced')
  t.ok(compiled.indexOf('require') === -1, 'no require call anymore')
  t.ok(compiled.indexOf('return _REDIS_SCRIPT["main"]()') > 0, 'Entry point result is returned')

  t.end();
});

test('it supports multiple requires', function(t) {
  var compiled = loadScripts('multi-scripts-require', luaPathConfig);

/**
-- The code below...

local invokeFunction = require('invokeFunction')
local main = require('sayHi')

-- is transformed to:

local invokeFunction = _REDIS_SCRIPT["invokeFunction"]()
local main = _REDIS_SCRIPT["sayHi"]()
*/
  t.ok(compiled.indexOf('local invokeFunction = _REDIS_SCRIPT["invokeFunction"]()' > 0), 'invokeFunction is replaced');
  t.ok(compiled.indexOf('local hello = _REDIS_SCRIPT["sayHi"]()') > 0, 'sayHi is replaced');
  t.end();
})

test('it can resolve nested paths', function(t) {
  var content = resolve('nested.main', luaPathConfig);
  t.ok(content.length > 0, 'nested file resolved')

  t.end();
});
