const term = require('./term');
colors = [term.ansi(6, true), term.ansi(2, true), term.ansi(3, true), term.ansi(1, true), term.ansi(1)];
const print = (color, caption, text) => process.stdout.write(`${colors[color] + term.ansi(7) + term.bold} ${caption} ${term.reset} ${text + term.reset}\n`);
module.exports = {
    info: text => print(0, 'INFO', text),
    success: text => print(1, 'OK', text),
    warn: text => print(2, 'WARN', text),
    error (text, err) {
        print(3, 'ERR', text);
        if (err) {
            if (!(err instanceof Array)) err = err.toString().split('\n');
            for (const line of err) process.stdout.write(` ${colors[4]}│${term.reset} ${line}\n`);
            process.stdout.write(` ${colors[4]}└─${term.reset}\n`);
        }
    }
};