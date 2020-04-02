const { Terminal } = require('../term');
const ui = require('../ui');
const { fs } = require('../utils');
const PathUtils = require('path');

Terminal.registerAction({
	name: 'init',
	description: 'Initialize dc-api-core project in `cwd` directory',
	params: {
		cwd: {
			name: 'backend-directory',
			description: 'Directory to use, current by default',
			default: '.'
		}
	},
	async handler (opts) {
		if (!opts.cwd) {
			opts.cwd = process.cwd();
		} else if (opts.cwd[0] != '/' && opts.cwd[0] != '\\') {
			opts.cwd = PathUtils.join(process.cwd(), opts.cwd);
		}

		console.log('Working in: ' + opts.cwd);
		if (fs.existsSync(opts.cwd) && fs.readdirSync(opts.cwd).length) {
			Terminal.print('Specified directory exists and contains files');
			const { action: result } = await ui.list('Choose action', [
				{ name: 'Exit', action: 'exit' },
				{ name: 'Reconfigure', action: 'configure' },
				{ name: 'Remove and reinitialize', action: 'init' }
			]);

			switch (result) {
				case 'exit':
					return;
				case 'configure':
					await Terminal.invokeAction('configure', { cwd: opts.cwd, skipCWD: true });
					return;
				case 'init':
					await fs.rmdir(opts.cwd, { recursive: true }, 'Can`t remove specified directory');
					break;
			}
		}

		await fs.mkdir(opts.cwd, 'Can`t create working directory');
		const config = await Terminal.invokeAction('configure', { cwd: opts.cwd, skipCWD: true });

		await fs.writeFile(
			opts.cwd + '/startup.js',
			'// This script will be started before API server\n// You can remove this optional file\n',
			'Can`t create startup script'
		);

		await fs.mkdir(opts.cwd + '/controllers', 'Can`t create "./controllers" directory');
		await fs.writeFile(
			opts.cwd + '/controllers/Info.js',
			[
				"const pkg = require('dc-api-code/package');",
				"module.exports = class Info {",
				"    status () {",
				`        // Available on http://localhost:${config.port}/Info/status`,
				"        return { version: pkg.version, time: new Date().toLocaleString() };",
				"    }",
				"}",
				""
			].join('\n'),
			'Can`t create /controllers/Info.js'
		);
	}
});

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