const { spawn } = require('child_process');
const { Terminal } = require('./term');

let currentPackager;
const PM_LIST = [
	{
		cmd: 'yarn',
		install: 'add'
	},
	{
		cmd: 'npm',
		install: 'i'
	}
];

function getVersion (cmd) {
	return new Promise(resolve => {
		let pmChild;
		pmChild = spawn(cmd, ['-v']);
		pmChild.on('error', () => {
			pmChild = null;
			resolve(false);
		})

		if (!pmChild) return;
		let version;

		pmChild.stdout.on('data', chunk => version = chunk.toString().trim());
		pmChild.on('exit', code => {
			resolve(code ? false : version);
		});
	});
}

/**
 * @returns {Promise}
 */
async function getPackager () {
	if (currentPackager) return currentPackager;

	for (const pm of PM_LIST) {
		const version = await getVersion(pm.cmd);
		if (version) {
			return {
				install (cwd, packages) {
					return new Promise(resolve => {
						const args = [pm.install, ...packages];
						log.info(`$ ${pm.cmd} ${args.join(' ')}`);

						const pmChild = spawn(pm.cmd, args, { cwd, stdio: 'inherit' });
						// TODO: terminal cleanup
						// let lines = 0;
						pmChild.on('exit', code => {
							if (code == 0) {
								// Terminal.clearLine(lines);
								resolve(true);
							} else {
								resolve(false);
							}
						});
					});
				}
			}
		}
	}
}

const log = require('./log');
module.exports = {
	async installPackage (pkg, cwd, name) {
		const packager = await getPackager();
		let list = name instanceof Array ? name : [name];
		if (pkg.dependencies) {
			list = list.map(name => !(name in pkg.dependencies));
		}

		const result = await packager.install(cwd, list);
		if (result) {
			log.success('Packages are successfully installed');
		} else {
			log.error('There are some errors occured while installation');
		}
		return result;
	}
};
