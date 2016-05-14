# redis.loadscripts

Naive script loader that allows require() from lua scripts in redis

# What?

Let's say you have two lua files:

``` lua
-- sayHi.lua
-- this file returns a function which says hello
return function(who)
  print('Hello ' .. who)
end


-- hello.lua
-- this file uses sayHi.lua to print Hello world:
local sayHi = require('sayHi')
sayHi('world')
```

If we attempt to run `hello.lua` from redis, we will get an error:

```
> redis-cli EVAL "$(cat hello.lua)" 0

(error) ERR Error running script (call to XXX):
@enable_strict_lua:15: user_script:1: Script attempted to access unexisting
global variable 'require'
```

To make it work, we need to tell redis what is `sayHi`. Enter `redis.loadscripts`.

```
> redis-cli EVAL "$(redis-load-scripts hello)" 0
(nil)
```

This will print "Hello world" in redis, as expected.

# How?

If we run example above:

```
redis-load-scripts hello
```

The output will be:

``` lua
local _REDIS_SCRIPT = {}

_REDIS_SCRIPT["hello"] = function()
  local sayHi = _REDIS_SCRIPT["sayHi"]()
  sayHi('world')
end

_REDIS_SCRIPT["sayHi"] = function()
  return function(who)
    print('Hello ' .. who)
  end
end

return _REDIS_SCRIPT["hello"]()
```

As you can see, the script has resolved all `require` calls to actual files,
and stored them into shared lua table `_REDIS_SCRIPT` with one twist. Instead of

```
require('sayHi')
```

The script printed:

```
_REDIS_SCRIPT["sayHi"]
```

This helps redis resolve actual code, and helps developers to reuse their bits
of code in large code bases.


# usage

To use it from node:

``` js
// This command will load `hello.lua` file that sits in the `luaPathConfig`
// folder.
var compiled = loadScripts('hello', luaPathConfig);

// `compiled` is now a script with all requires resolved
```

To use it from command line, make sure you've installed it:

```
npm install -g redis-load-scripts
```

and then call

```
redis-load-scripts
```

# license

MIT
