#!/usr/bin/env node
const term = require('./term');
async function page (name, action = 'print') {
	await require('./pages/' + name + '.js')[action]();
	process.exit();
}

(async () => {
	switch (term.actions[0]) {
		case 'init':
			await page('init');
		case 'help':
		case 'usage':
			page('help');
		case undefined:
			if (term.args['--help'] || term.args['-h'] || term.args['--usage']) {
				page('help');
			} else if (term.args['--version'] || term.args['-v']) {
				console.log(require('./package.json').version);
				process.exit();
			}
		default:
			page('help', 'header');
	}
})();
