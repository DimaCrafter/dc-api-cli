const { EventEmitter } = require('events');
const term = new EventEmitter();

const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
if (process.stdin.setRawMode) process.stdin.setRawMode(true);
let input = '';
process.stdin.on('keypress', (str, key) => {
	if (key.ctrl && key.name == 'c') return process.exit(0);
	if (key.name == 'return') {
		term.emit('line', input);
		input = '';
	} else if (!str || str == ' ') {
		term.emit('key', key);
	} else {
		if (key.name == 'backspace') {
			input = input.slice(0, -1);
			term.emit('key', key);
		} else {
			input += str;
			term.emit('symbol', str);
		}
	} 
});

const COLOR = 30;
const BG = 40;
term.reset = '\x1B[0m';
term.bold = '\x1B[1m';
term.ansi = (color, isBG = false) => `\x1B[${color + (isBG ? BG : COLOR)}m`;
term.clear = lines => {
	process.stdout.write('\r');
	process.stdout.moveCursor(0, -lines);
	readline.clearScreenDown(process.stdout);
};

term.actions = [];
term.args = {};
let argsParse = false;
let currentArg;
for (const arg of process.argv.slice(2)) {
	if (argsParse) {
		if (arg[0] == '-') {
			if (currentArg) term.args[currentArg] = true;
			currentArg = arg;
		} else {
			term.args[currentArg] = arg;
		}
	} else {
		if (arg[0] == '-') {
			argsParse = true;
			currentArg = arg;
		} else {
			term.actions.push(arg);
		}
	}
}

if (currentArg && !term.args[currentArg]) term.args[currentArg] = true;
module.exports = term;
