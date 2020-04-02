#!/usr/bin/env node
const { Terminal } = require('./term');
require('./pages/init');
require('./pages/configure');

const result = Terminal.dispatch();
if (result) result.then(() => process.exit(0));
else process.exit(0);
