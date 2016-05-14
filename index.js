module.exports = compile;

var resolve = require('./lib/resolve.js');

var scriptsTableName = '_REDIS_SCRIPT';

// TODO: use luaparse?
var requireMatch = /\brequire\s*\(\s*['"]([^'"]+)['"]\)/g;

function compile(entryName, config) {
  var scripts = loadAllScripts(entryName, config)

  return printScripts(scripts, entryName);
}

function loadAllScripts(entryName, config) {
  var scripts = Object.create(null);
  var loadedScripts = Object.create(null);
  var scriptsToLoad = [];
  markToLoad(entryName);

  processQueue();

  return scripts;

  function processQueue() {
    while(scriptsToLoad.length > 0) {
      loadSingleScript(scriptsToLoad.pop());
    }
  }

  function loadSingleScript(scriptName) {
    var code = resolve(scriptName, config);

    scripts[scriptName] = code.replace(requireMatch, function(match, moduleName) {
      markToLoad(moduleName);

      // TODO: require without variable?
      return scriptsTableName + '["' + moduleName + '"]()';
    });
  }

  function markToLoad(scriptName) {
      if (loadedScripts[scriptName]) return

      loadedScripts[scriptName] = true;
      scriptsToLoad.push(scriptName);
  }
}

function printScripts(scripts, entryName) {
  var redisScripts = Object.keys(scripts).map(toRedisScriptDefinition);

  // first we define all required scripts in the table
  var finalScript = 'local ' + scriptsTableName + ' = {}\n' +
      redisScripts.join('\n') + '\n' +
      // Kick off from entry point:
      'return ' + scriptsTableName + '["' + entryName + '"]()'

  return finalScript;

  function toRedisScriptDefinition(scriptName) {
    var code = scripts[scriptName];

    return scriptsTableName + '["' + scriptName + '"] = function()\n' + code + '\nend\n';
  }
}
