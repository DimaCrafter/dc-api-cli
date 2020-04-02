const ui = require('../ui');
module.exports = {
	header (hint = true) {
		console.log('Usage:');
		console.log('dc-api-cli <action> [sub actions] [options]');
		console.log();
		if (hint) console.log('Use action `help` or `usage` or options -h, --help or --usage without action to print full help');
	},

	print () {
		this.header(false);
		ui.table([
			'header',
			['Action', 'Options', 'Description'],
			'divider',
			['init', '[backend-directory]', 'Initialize dc-api-core project in `backend-directory`'],
			// ['init-frontend', '[frontend-directory]', 'Initialize frontend project in `frontend-directory`'],
			// ['configure', '', 'Configure dc-api-core project in current directory'],
			'divider',
			['<no-action>', '-v or --version', 'Prints dc-api-cli version']
		]);
	}
}
