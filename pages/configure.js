const { Terminal } = require('../term');
const ui = require('../ui');
const { genString, fs, fetchMeta, patchPackage } = require('../utils');
const PathUtils = require('path');
const { installPackage } = require('../pm');

Terminal.registerAction({
	name: 'configure',
	description: 'Reconfigure dc-api-core project in `cwd` directory',
	params: {
		cwd: {
			name: 'backend-directory',
			default: '.'
		}
	},
	async handler (opts) {
		if (!opts.skipCWD) console.log('Working in: ' + opts.cwd);
		const port = Number(await ui.input('Enter port', 8080));

		const pluginList = await ui.preloader(fetchMeta('plugins'), 'Loading plugin list...');
		Terminal.clearLine();
		const plugins = await ui.checklist('Plugins', pluginList);
		const session = await ui.list('Select session provider', ['No session', ...plugins]);

		let config;
		if (await fs.exists(opts.cwd + '/config.json', 'Can`t access config.json')) {
			config = await fs.readFile(opts.cwd + '/config.json', 'Can`t access config.json');
			try {
				config = JSON.parse(config);
				config.port = port;
			} catch (err) {
				throw ['Can`t parse config.json', err];
			}
		} else {
			config = { port };
		}

		if (plugins.length) {
			config.plugins = plugins.map(plugin => plugin.name);
		}

		if (session != 'No session') {
			config.session = {
				secret: genString(32),
				store: session.name
			};
		}

		await fs.writeFile(
			opts.cwd + '/config.json',
			JSON.stringify(config, null, 4),
			'Can`t create config'
		);

		let pkgData;
		if (await fs.exists(opts.cwd + '/package.json', 'Can`t access package.json')) {
			pkgData = await fs.readFile(opts.cwd + '/package.json', 'Can`t access package.json');
			try { pkgData = JSON.parse(pkgData); }
			catch (err) { throw ['Can`t parse package.json', err]; }
		} else {
			pkgData = {
				name: PathUtils.basename(opts.cwd),
				version: '1.0.0'
			};
		}

		patchPackage(pkgData, 'scripts', {
			start: 'dc-api-core',
			dev: 'dc-api-core --dev'
		});

		await fs.writeFile(
			opts.cwd + '/package.json',
			JSON.stringify(pkgData, null, 4),
			'Can`t write package.json'
		);

		await installPackage(pkgData, opts.cwd, ['dc-api-core', ...plugins.map(plugin => plugin.name)]);

		return config;
	}
});
