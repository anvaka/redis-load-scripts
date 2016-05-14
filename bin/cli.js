#!/usr/bin/env node
var loadScripts = require('../index.js');
var program = require('commander');

program
  .version('0.1.0')
  .usage('[options] script.lua')
  .option('-p, --path <directory>', 'Lua modules path lookup')
  .parse(process.argv);

if (program.args.length !== 1) {
 program.outputHelp();
 return;
}

console.log(loadScripts(program.args[0], program.path))
