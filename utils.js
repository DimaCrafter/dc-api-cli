const fs = require('fs');
const http = require('https');
const symbols = 'qQwWeErRtTyYuUiIoOpPaAsSdDfFgGhHjJkKlLzZxXcCvVbBnNmM1!2@3#4$5%6^7&8*9(0)-_+:/,<.>? ';

var fsPromised = {};
for (const key in fs) {
	if (typeof fs[key] == 'function') {
		if (key.endsWith('Sync')) {
			fsPromised[key] = fs[key];
			continue;
		}

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
	},

	fetchMeta (type) {
		return new Promise(resolve => {
			const req = http.request('https://dimacrafter.github.io/dc-api-core/meta/' + type + '.json', res => {
				let body = '';
				res.on('data', chunk => body += chunk.toString());
				res.on('end', () => {
					resolve(JSON.parse(body));
				});
			});

			req.end();
		});
	},

	patchPackage (pkg, obj, data) {
		if (!pkg[obj]) pkg[obj] = {};

		for (const prop in data) {
			if (prop in pkg[obj]) {
				pkg[obj]['old-' + prop] = pkg[obj][prop];
			}

			pkg[obj][prop] = data[prop];
		}
	}
};
