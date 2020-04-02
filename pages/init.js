const PathUtils = require('path');
const ui = require('../ui');
const term = require('../term');
const log = require('../log');
const { genString, fs } = require('../utils')

module.exports = {
	async print () {
		let cwd = term.actions[1];
		if (!cwd) cwd = process.cwd();
		else if (cwd[0] != '/' && cwd[0] != '\\') cwd = PathUtils.join(process.cwd(), cwd);

		console.log('Working in: ' + cwd);
		const port = Number(await ui.input('Enter port', 8080));
		const plugins = await ui.checklist('Plugins', ['dc-api-mongo'/*, 'dc-api-mysql', 'dc-api-sqlite'*/]);
		const session = await ui.list('Select session provider', ['No session', ...plugins]);

		let config = { port };
		if (plugins.length) config.plugins = plugins;

		if (session != 'No session') {
			config.session = {
				secret: genString(32),
				store: session
			};
		}

		try {
			await fs.mkdir(cwd, 'Can`t create working directory');
			await fs.writeFile(
				cwd + '/startup.js',
				'// This script will be started before API server\n// You can remove this optional file\n',
				'Can`t create startup script'
			);
			await fs.writeFile(
				cwd + '/config.json',
				JSON.stringify(config, null, 4),
				'Can`t create config'
			);

			await fs.mkdir(cwd + '/controllers', 'Can`t create "./controllers" directory');
			await fs.writeFile(
				cwd + '/controllers/Info.js',
				[
					"const pkg = require('dc-api-code/package');",
					"module.exports = class Info {",
					"    status () {",
					`        // Available on http://localhost:${port}/Info/status`,
					"        this.send({ version: pkg.version, time: new Date().toLocaleString() });",
					"    }",
					"}",
					""
				].join('\n'),
				'Can`t create config'
			);

			let pkgData;
			if (await fs.exists(cwd + '/package.json', 'Can`t access package.json')) {
				pkgData = await fs.readFile(cwd + '/package.json', 'Can`t access package.json');
				try { pkgData = JSON.parse(pkgData); }
				catch (err) { throw ['Can`t parse package.json', err]; }
			} else {
				pkgData = {
					name: PathUtils.basename(cwd),
					version: '1.0.0'
				};
			}

			if (!pkgData.scripts) pkgData.scripts = {};
			if (pkgData.scripts.start) pkgData.scripts['old-start'] = pkgData.scripts.start;
			pkgData.scripts.start = 'dc-api-core';
			if (pkgData.scripts.dev) pkgData.scripts['old-dev'] = pkgData.scripts.dev;
			pkgData.scripts.dev = 'dc-api-core --dev';

			await fs.writeFile(
				cwd + '/package.json',
				JSON.stringify(pkgData, null, 4),
				'Can`t write package.json'
			);
		} catch (err) {
			if (err.length) log.error(...err);
			else log.error('Unexpected error', err);
		}
	}
};

/*
 * No front-end
 * Vue
 * Angular
 * AngularJS
 * React
 * Choo.io
 * Parcel
 * Webpack
 */
