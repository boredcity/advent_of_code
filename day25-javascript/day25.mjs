import fs from 'node:fs';
import readline from 'node:readline';
const snafuNotationChars = ['=', '-', '0', '1', '2'];

function snafuToDecimal(line) {
    return line
        .split('')
        .reverse()
        .map(digit => {
            if (digit == '-') {
                return -1;
            } else if (digit == '=') {
                return -2;
            }
            return Number.parseInt(digit);
        })
        .map((d, i) => d * 5 ** i)
        .reduce((acc, v) => acc + v);
}

function decimalToSnafu(num) {
    let result = [];
    while (num > 0) {
        const index = (num + 2) % 5;
        num = Math.floor((num + 2) / 5);
        result.push(snafuNotationChars[index]);
    }

    return result.reverse().join('');
}

(async function main() {
    let sum = 0;
    for await (const line of readline.createInterface({
        input: fs.createReadStream('input.txt')
    }))
        sum += snafuToDecimal(line);
    console.log(`Final result is: ${decimalToSnafu(sum)} (${sum})`);
})();
