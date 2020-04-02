const { Terminal } = require('../term');
const ui = require('../ui');

module.exports = {
	header (hint = true) {
		Terminal.print('Usage:');
		Terminal.print('dc-api-cli <action> [sub actions] [options]');
		Terminal.print('');

		if (hint) {
			Terminal.print('Use `help` or `usage` action or options -h, --help or --usage without any action to print help');
		}
	},

	full () {
		const table = [
			'header',
			['Action', 'Options', 'Description'],
			'divider',
			// ['init-plugin', '[plugin-directory]', 'Configure development environment for dc-api-core plugin in `plugin-directory`'],
			// ['init-frontend', '[frontend-directory]', 'Initialize frontend project in `frontend-directory`']
		];

		for (const action of Terminal._actions) {
			const params = [];
			for (const paramName in action.params) {
				const param = action.params[paramName];
				params.push(
					(param.default ? '[' : '<')
				  + paramName
				  + (param.default ? ' = ' + param.default : '')
				  + (param.default ? ']' : '>')
				);
			}

			table.push([action.name, params.join(' '), action.description]);
		}

		table.push(
			'divider',
			['No any action', '-v or --version', 'Prints dc-api-cli version']
		);

		this.header(false);
		ui.table(table);
	}
};
