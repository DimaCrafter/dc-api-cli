const fs = require('fs');
const symbols = 'qQwWeErRtTyYuUiIoOpPaAsSdDfFgGhHjJkKlLzZxXcCvVbBnNmM1!2@3#4$5%6^7&8*9(0)-_+:/,<.>? ';

var fsPromised = {};
for (const key in fs) {
	if (typeof fs[key] == 'function') {
		fsPromised[key] = function () {
			return new Promise((resolve, reject) => {
				let args = Array.from(arguments);
				const errText = args[args.length - 1];
				args = args.slice(0, -1);

				fs[key](...args, (err, result) => {
					if (key == 'exists') return resolve(err);
					if (err && err.code != 'EEXIST') return reject([errText, err]);
					resolve(result);
				});
			});
		};
	}
}

module.exports = {
	fs: fsPromised,
	genString (length) {
		let result = '';
		for (let i = 0; i < length; i++) {
			result += symbols[Math.round(Math.random() * (symbols.length - 1))];
		}
		return result;
	}
};
