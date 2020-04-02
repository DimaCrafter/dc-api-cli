const { Terminal } = require('./term');

function getItemText (item, isFull = true) {
	if (typeof item == 'string') return item;
	else if (isFull) {
		let result = item.name;
		if (item.description) {
			result += '\t' + Terminal.ansi(3) + item.description + Terminal.RESET;
		}

		return result;
	} else {
		return item.name;
	}
}

module.exports.list = (caption, items) => {
	let selected = 0;
	function render (isClear = false) {
		if (isClear) Terminal.clearLine(items.length + 1);
		process.stdout.write(`${caption}: ${Terminal.ansi(6)}(use arrow keys to select and enter to submit)${Terminal.RESET}\n`);
		for (let i = 0; i < items.length; i++) {
			if (i == selected) process.stdout.write(`${Terminal.ansi(2)}➔ ${getItemText(items[i])}${Terminal.RESET}\n`);
			else process.stdout.write('  ' + getItemText(items[i]) + '\n');
		}
	};

	render();
	process.stdin.resume();
	const trigger = key => {
		switch (key.name) {
			case 'up':
				selected--;
				if (selected < 0) selected = items.length - 1;
				render(true);
				break;
			case 'down':
				selected++;
				if (selected == items.length) selected = 0;
				render(true);
				break;
		}
	};

	Terminal.on('key', trigger);
	return new Promise(resolve => {
		Terminal.once('line', () => {
			process.stdin.pause();
			Terminal.off('key', trigger);
			Terminal.clearLine(items.length + 1);
			process.stdout.write(caption + ' ' + Terminal.ansi(6) + getItemText(items[selected], false) + Terminal.RESET + '\n');
			resolve(items[selected]);
		});
	});
};

module.exports.checklist = (caption, items) => {
	let selected = 0;
	let checked = [];
	function render (isClear = false) {
		if (isClear) Terminal.clearLine(items.length + 1);
		process.stdout.write(`${caption}: ${Terminal.ansi(6)}(use arrow keys to move, space to toggle and enter to submit)${Terminal.RESET}\n`);
		for (let i = 0; i < items.length; i++) {
			let line = '';
			if (i == selected) line = Terminal.ansi(2);
			line += ~checked.indexOf(i) ? 'x' : '·';
			line += ' ' + getItemText(items[i]) + Terminal.RESET + '\n';
			process.stdout.write(line);
		}
	};

	render();
	process.stdin.resume();
	const trigger = key => {
		switch (key.name) {
			case 'up':
				selected--;
				if (selected < 0) selected = items.length - 1;
				render(true);
				break;
			case 'down':
				selected++;
				if (selected == items.length) selected = 0;
				render(true);
				break;
			case 'space':
				const i = checked.indexOf(selected);
				if (~i) checked.splice(i, 1);
				else checked.push(selected);
				render(true);
				break;
		}
	};

	Terminal.on('key', trigger);
	return new Promise(resolve => {
		Terminal.once('line', () => {
			process.stdin.pause();
			Terminal.off('key', trigger);
			Terminal.clearLine(items.length + 1);

			checked = checked.map(i => items[i]);
			const checkedNames = checked.map(item => getItemText(item, false));

			process.stdout.write(caption + ' ' + Terminal.ansi(6) + checkedNames.join(', ') + Terminal.RESET + '\n');
			resolve(checked);
		});
	});
};

module.exports.table = rows => {
	let colWidth = [];
	for (const row of rows) {
		if (row === 'divider' || row === 'header') continue;
		for (let i = 0; i < row.length; i++) {
			if (!colWidth[i]) colWidth[i] = 0;
			if (colWidth[i] < row[i].length) colWidth[i] = row[i].length;
		}
	}

	let mode;
	for (const row of rows) {
		if (row === 'header') {
			mode = 'header';
		} else if (row === 'divider') {
			mode = undefined;
			process.stdout.write(Terminal.ansi(4));
			for (let i = 0; i < colWidth.length; i++) {
				process.stdout.write(''.padEnd(colWidth[i], '┄') + ((i < row.length - 1) ? '  ' : ''));
			}
			process.stdout.write(Terminal.RESET);
		} else {
			if (mode === 'header') process.stdout.write(Terminal.ansi(4) + Terminal.BOLD);
			for (let i = 0; i < row.length; i++) {
				process.stdout.write(row[i].padEnd(colWidth[i], ' ') + ((i < row.length - 1) ? '  ' : ''));
			}
			if (mode === 'header') process.stdout.write(Terminal.RESET);
		}
		process.stdout.write('\n');
	}
}

module.exports.input = (caption, initial = '') => {
	return new Promise(resolve => {
		let value = initial.toString();
		let offset = value.length;
		function render (isClear = false) {
			if (isClear) {
				process.stdout.write('\r');
				Terminal.clearLine();
			}

			process.stdout.write(caption + ': ' + Terminal.ansi(6) + value + Terminal.RESET);
			process.stdout.moveCursor(offset - value.length, 0);
		}

		render();
		process.stdin.resume();
		Terminal.on('symbol', symbol => {
			value = value.slice(0, offset) + symbol + value.slice(offset);
			offset++;
			render(true, value);
		});

		Terminal.on('key', key => {
			switch (key.name) {
				case 'left':
					if (offset > 0) { offset--; render(true); }
					break;
				case 'right':
					if (offset < value.length) { offset++; render(true); }
					break;
				case 'space':
					value += ' ';
					render(true, value);
					break;
				case 'backspace':
					value = value.slice(0, offset - 1) + value.slice(offset);
					if (offset > 0) offset--;
					render(true, value);
					break;
				case 'delete':
					value = value.slice(0, offset) + value.slice(offset + 1);
					render(true, value);
					break;
			}
		});

		Terminal.once('line', () => {
			if (!value.trim()) {
				value = initial;
				render(true);
			}

			process.stdout.write('\n');
			resolve(value);
			process.stdin.pause();
		});
	});
};

const PRELOADER_FRAMES = [
	'⠂  ',
	'⠕  ',
	'⠨⠂ ',
	'⠂⠕ ',
	'⠕⠨⠂',
	'⠨⠂⠕',
	'⠂⠕⠨',
	'⠕⠨⠂',
	'⠨⠂⠕',
	' ⠕⠨',
	' ⠨⠂',
	'  ⠕',
	'  ⠨',
	'   '
];
module.exports.preloader = (promise, caption) => {
	let step = 0;
	function render (state) {
		Terminal.clearLine();
		if (state === undefined) {
			if (++step == PRELOADER_FRAMES.length) step = 0;
			process.stdout.write(`${Terminal.ansi(6) + PRELOADER_FRAMES[step] + Terminal.RESET} ${caption}`);
		} else if (state) {
			process.stdout.write(`${Terminal.ansi(2) + '[✔︎]' + Terminal.RESET} ${caption}\n`);
		} else {
			process.stdout.write(`${Terminal.ansi(1) + '[✘]' + Terminal.RESET} ${caption}\n`);
		}
	}

	render();
	const interval = setInterval(render, 120);

	return promise.then(res => {
		clearInterval(interval);
		render(true);
		return res;
	}).catch(res => {
		clearInterval(interval);
		render(true);
		return res;
	});
}
