import fs from 'node:fs';
import readline from 'node:readline';
const isFn = value => typeof value === 'function';
function inferX(sign, left, right, result) {
    switch (sign) {
        case '+':
            if (!result) return left + right;
            return isFn(left) ? left(result - right) : right(result - left);
        case '-':
            if (!result) return left - right;
            return isFn(left) ? left(result + right) : right(left - result);
        case '/':
            if (!result) return left / right;
            return isFn(left) ? left(result * right) : right(left / result);
        case '*':
            if (!result) return left * right;
            return isFn(left) ? left(result / right) : right(result / left);
    }
}
function setIntoRoster(monkeys, line, overrides) {
    const [name, work] = line.split(': ');
    const [m1, sign, m2] = work.split(' ');
    if (overrides?.[name]) {
        monkeys[name] = () => overrides[name](monkeys, m1, m2);
    } else if (sign === undefined) {
        monkeys[name] = () => Number.parseInt(work);
    } else {
        monkeys[name] = () => {
            const values = [monkeys[m1](), monkeys[m2]()];
            if (values.some(isFn)) return res => inferX(sign, ...values, res);
            return inferX(sign, ...values);
        };
    }
}
const or = {
    humn: _ => res => res,
    root: (monkeys, m1, m2) => {
        const [left, right] = [monkeys[m1](), monkeys[m2]()];
        return isFn(left) ? left(right) : right(left);
    }
};
const readlineInterfaceArg = { input: fs.createReadStream('input.txt') };
const roasters = [Object.create(null), Object.create(null)];
for await (const line of readline.createInterface(readlineInterfaceArg))
    setIntoRoster(roasters[0], line), setIntoRoster(roasters[1], line, or);
console.log(`Task 1 result is: ${roasters[0].root()}`);
console.log(`Task 2 result is: ${roasters[1].root()}`);