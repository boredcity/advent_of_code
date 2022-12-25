import fs from 'node:fs';

const snafuNotationChars = ['=', '-', '0', '1', '2'];
const snafuValues = { '-': -1, '=': -2 };

const snafuToDecimal = line =>
    line
        .split('')
        .reverse()
        .map(digit => snafuValues[digit] ?? Number.parseInt(digit))
        .map((d, i) => d * 5 ** i)
        .reduce((acc, v) => acc + v);

function decimalToSnafu(num) {
    let result = [];
    while (num > 0) {
        const remainder = (num + 2) % 5;
        num = Math.floor((num + 2) / 5);
        result.push(snafuNotationChars[remainder]);
    }
    return result.reverse().join('');
}

let sum = 0;
for (const line of fs.readFileSync('input.txt').toString().split('\n'))
    sum += snafuToDecimal(line);
console.log(`Final result is: ${decimalToSnafu(sum)} (${sum})`);
