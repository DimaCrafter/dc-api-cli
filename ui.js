const term = require('./term');
module.exports.list = (caption, items) => {
	let selected = 0;
	function render (isClear = false) {
		if (isClear) term.clear(items.length + 1);
		process.stdout.write(`${caption}: ${term.ansi(6)}(use arrow keys to select and enter to submit)${term.reset}\n`);
		for (let i = 0; i < items.length; i++) {
			if (i == selected) process.stdout.write(`${term.ansi(2)}➔ ${items[i]}${term.reset}\n`);
			else process.stdout.write('  ' + items[i] + '\n');
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

	term.on('key', trigger);
	return new Promise(resolve => {
		term.once('line', () => {
			process.stdin.pause();
			term.off('key', trigger);
			term.clear(items.length + 1);
			process.stdout.write(caption + ' ' + term.ansi(6) + items[selected] + term.reset + '\n');
			resolve(items[selected]);
		});
	});
};

module.exports.checklist = (caption, items) => {
	let selected = 0;
	let checked = [];
	function render (isClear = false) {
		if (isClear) term.clear(items.length + 1);
		process.stdout.write(`${caption}: ${term.ansi(6)}(use arrow keys to move, space to toggle and enter to submit)${term.reset}\n`);
		for (let i = 0; i < items.length; i++) {
			let line = '';
			if (i == selected) line = term.ansi(2);
			line += ~checked.indexOf(i) ? 'x' : '·';
			line += ' ' + items[i] + term.reset + '\n';
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

	term.on('key', trigger);
	return new Promise(resolve => {
		term.once('line', () => {
			process.stdin.pause();
			term.off('key', trigger);
			term.clear(items.length + 1);
			checked = checked.map(i => items[i]);
			process.stdout.write(caption + ' ' + term.ansi(6) + checked.join(', ') + term.reset + '\n');
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
			process.stdout.write(term.ansi(4));
			for (let i = 0; i < colWidth.length; i++) {
				process.stdout.write(''.padEnd(colWidth[i], '┄') + ((i < row.length - 1) ? '  ' : ''));
			}
			process.stdout.write(term.reset);
		} else {
			if (mode === 'header') process.stdout.write(term.ansi(4) + term.bold);
			for (let i = 0; i < row.length; i++) {
				process.stdout.write(row[i].padEnd(colWidth[i], ' ') + ((i < row.length - 1) ? '  ' : ''));
			}
			if (mode === 'header') process.stdout.write(term.reset);
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
				term.clear();
			}

			process.stdout.write(caption + ': ' + term.ansi(6) + value + term.reset);
			process.stdout.moveCursor(offset - value.length, 0);
		}

		render();
		process.stdin.resume();
		term.on('symbol', symbol => {
			value = value.slice(0, offset) + symbol + value.slice(offset);
			offset++;
			render(true, value);
		});

		term.on('key', key => {
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

		term.once('line', () => {
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
