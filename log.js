const { Terminal } = require('./term');
const colors = [
    Terminal.ansi(6, true),
    Terminal.ansi(2, true),
    Terminal.ansi(3, true),
    Terminal.ansi(1, true),
    Terminal.ansi(1)
];

function print (color, caption, text) {
    return process.stdout.write(`${colors[color] + Terminal.ansi(7) + Terminal.BOLD} ${caption} ${Terminal.RESET} ${text + Terminal.RESET}\n`);
}

module.exports = {
    info: text => print(0, 'INFO', text),
    success: text => print(1, 'OK', text),
    warn: text => print(2, 'WARN', text),
    error (text, err) {
        print(3, 'ERR', text);
        if (err) {
            if (!(err instanceof Array)) err = err.toString().split('\n');
            for (const line of err) process.stdout.write(` ${colors[4]}│${Terminal.RESET} ${line}\n`);
            process.stdout.write(` ${colors[4]}└─${Terminal.RESET}\n`);
        }
    }
};