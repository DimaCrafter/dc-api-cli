const { EventEmitter } = require('events');

const Terminal = new class Terminal extends EventEmitter {
	// TTY utils
	RESET = '\x1B[0m';
	BOLD = '\x1B[1m';

	/** Returns ANSI coloring symbols sequence */
	ansi (color, isBG = false) {
		return `\x1B[${color + (isBG ? 40 : 30)}m`;
	}

	clearLine (lines = 0) {
		process.stdout.write('\r');
		process.stdout.moveCursor(0, -lines);
		readline.clearScreenDown(process.stdout);
	}

	/** Just prints text to stdout with new line symbol */
	print (line) {
		process.stdout.write(line + '\n');
	}

	// CLI utils
	_actions = [];
	registerAction (action) {
		this._actions.push(action);
	}

	/** Parse CLI input and call matched action */
	dispatch () {
		switch (process.argv[2]) {
			case '-v':
			case '--version':
				process.stdout.write(require('./package').version);
				process.stdout.isTTY && process.stdout.write('\n');
				break;
			case '-h':
			case '--help':
			case '--usage':
			case 'help':
			case 'usage':
				require('./pages/help').full();
				break;
			default:
				for (const action of this._actions) {
					if (action.name == process.argv[2]) {
						try {
							return action.handler(this._parse(action));
						} catch (err) {
							if (err.length) log.error(...err);
							else log.error('Unexpected error', err);
						}
					}
				}

				this.print('No action matching this arguments found\n');
				require('./pages/help').header();
				break;
		}
	}

	invokeAction (name, opts) {
		for (const action of this._actions) {
			if (action.name == name) {
				return action.handler(opts);
			}
		}
	}

	_parseError (text) {
		log.error(text);
		process.exit(-1);
	}

	_parse (action) {
		const argvLength = process.argv.length;
		let currentArg;
		let currentParam = 0;
		const parsed = {};

		args_loop:
		for (let i = 3; i < argvLength; i++) {
			const part = process.argv[i];
			if (part[0] == '-') {
				if (action.args) {
					const isShort = part[1] != '-';
					for (const argProp in action.args) {
						const argInfo = action.args[argProp];
						if (isShort ? (argInfo.short == part.slice(1)) : (argInfo.name == part.slice(2))) {
							currentArg = argProp;
							continue args_loop;
						}
					}

					this._parseError(`This action has no "${part}" argument`);
				} else {
					this._parseError('This action takes no argument');
				}
			} else if (currentArg) {
				switch (action.args[currentArg].type) {
					case String:
						parsed[currentArg] = part;
						break;
					case Number:
						parsed[currentArg] = Number(part);
						break;
					case Boolean:
						if (part == 'true' || part == '1') {
							parsed[currentArg] = true;
						} else if (part == 'false' || part == '0') {
							parsed[currentArg] = false;
						}
						break;
				}

				currentArg = null;
			} else {
				if (action.params) {
					const [paramProp, paramInfo] = Object.entries(action.params)[currentParam++];
					parsed[paramProp] = part;
				} else {
					this._parseError('This action has no parameters');
				}
			}
		}

		for (const argProp in action.args) {
			if (argProp in parsed) continue;

			const argInfo = action.args[argProp];
			if (argInfo.default === undefined) {
				this._parseError(`The "--${argInfo.name}"${argsInfo.short ? ` or "-${argsInfo.short}"` : ''} argument is required for current action`);
			} else {
				parsed[argProp] = argInfo.default;
			}
		}

		for (const paramProp in action.params) {
			if (paramProp in parsed) continue;

			const paramInfo = action.params[paramProp];
			if (paramInfo.default === undefined) {
				this._parseError(`The "${paramInfo.name}" parameter is required for current action`);
			} else {
				parsed[paramProp] = paramInfo.default;
			}
		}

		return parsed;
	}
}

module.exports = { Terminal };

const readline = require('readline');
const log = require('./log');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) process.stdin.setRawMode(true);

let input = '';
process.stdin.on('keypress', (str, key) => {
	if (key.ctrl && key.name == 'c') return process.exit(0);
	if (key.name == 'return') {
		Terminal.emit('line', input);
		input = '';
	} else if (!str || str == ' ') {
		Terminal.emit('key', key);
	} else {
		if (key.name == 'backspace') {
			input = input.slice(0, -1);
			Terminal.emit('key', key);
		} else {
			input += str;
			Terminal.emit('symbol', str);
		}
	}
});
