import fs from 'node:fs';
import readline from 'node:readline';

function inferMissingData(sign, first, second, result) {
    const isFirstFunc = typeof first === 'function';
    switch (sign) {
        case '+':
            if (!result) return first + second;
            return isFirstFunc
                ? first(result - second)
                : second(result - first);
        case '-':
            if (!result) return first - second;
            return isFirstFunc
                ? first(result + second)
                : second(first - result);
        case '/':
            if (!result) return first / second;
            return isFirstFunc
                ? first(result * second)
                : second(first / result);
        case '*':
            if (!result) return first * second;
            return isFirstFunc
                ? first(result / second)
                : second(result / first);
    }
}

function setIntoMonkeysMap(monkeys, line, overrides) {
    const [name, work] = line.split(': ');
    const [m1, sign, m2] = work.split(' ');
    monkeys[name] = overrides?.[name]
        ? () => overrides[name](monkeys, m1, m2)
        : !sign
        ? () => Number.parseInt(work)
        : () => {
              const results = [monkeys[m1](), monkeys[m2]()];
              if (results.some(r => typeof r === 'function'))
                  return target => inferMissingData(sign, ...results, target);
              return inferMissingData(sign, ...results);
          };
}

const monkeys1 = Object.create(null);
const monkeys2 = Object.create(null);
const task2Overrides = {
    humn: _ => x => x,
    root: (monkeys, m1, m2) => {
        const result1 = monkeys[m1]();
        const result2 = monkeys[m2]();
        if (typeof result1 === 'function') return result1(result2);
        if (typeof result2 === 'function') return result2(result1);
    }
};
const readlineInterfaceArg = { input: fs.createReadStream('input.txt') };
for await (const line of readline.createInterface(readlineInterfaceArg)) {
    setIntoMonkeysMap(monkeys1, line);
    setIntoMonkeysMap(monkeys2, line, task2Overrides);
}
console.log(`Task 1 result is: ${monkeys1.root()}`);
console.log(`Task 2 result is: ${monkeys2.root()}`);