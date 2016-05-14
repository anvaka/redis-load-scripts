/**
 * Synchronously resulves and reads lua file.
 */
module.exports = resolve;

// TODO: Will I regret that it's global?
var resolved = Object.create(null);

var path = require('path');
var fs = require('fs');

/**
 * @param {string} name - lua script file name, without extension
 * @param {string|array} paths - where to lookup for .lua files
 */
function resolve(name, paths) {
  if (resolved[name]) return resolved[name];

  if (typeof paths === 'string') {
    paths = [paths]; // lookup at single path
  } else if (!paths) {
    paths = ['']; // lookup in current folder
  }

  for (var i = 0; i < paths.length; ++i) {
    var fullPath = path.join(paths[i], name + '.lua');
    var filePresent = fs.existsSync(fullPath)
    if (filePresent) {
      resolved[name] = fs.readFileSync(fullPath, 'utf8');
      return resolved[name]
    }
  }

  throw new Error('Cannot find file ' + name + '; Lookup paths: ' + JSON.stringify(paths));
}
