import fs from 'node:fs';
import readline from 'node:readline';

const HUMAN = 'humn';
const ROOT_MONKEY = 'root';

function inferMissingData(sign, first, second, result) {
    const isFirstFunc = typeof first === 'function';
    switch (sign) {
        case '+': {
            if (!result) return first + second;
            return isFirstFunc
                ? first(result - second)
                : second(result - first);
        }
        case '-': {
            if (!result) return first - second;
            return isFirstFunc
                ? first(result + second)
                : second(first - result);
        }
        case '/': {
            if (!result) return first / second;
            return isFirstFunc
                ? first(result * second)
                : second(first / result);
        }
        case '*': {
            if (!result) return first * second;
            return isFirstFunc
                ? first(result / second)
                : second(result / first);
        }
    }
}

function setIntoMonkeysMap(monkeys, line, overrides) {
    const [name, work] = line.split(': ');
    const [m1, sign, m2] = work.split(' ');
    if (overrides?.[name])
        return (monkeys[name] = () => overrides[name](monkeys, m1, m2));
    monkeys[name] = !sign
        ? () => Number.parseInt(work)
        : () => {
              const results = [monkeys[m1](), monkeys[m2]()];
              if (results.some(r => typeof r === 'function'))
                  return target => inferMissingData(sign, ...results, target);
              return inferMissingData(sign, ...results);
          };
}

const readlineInterfaceArg = { input: fs.createReadStream('input.txt') };
const rl = readline.createInterface(readlineInterfaceArg);
const monkeyGroups = [Object.create(null), Object.create(null)];
const task2Overrides = {
    [HUMAN]: () => x => x,
    [ROOT_MONKEY]: (monkeys, m1, m2) => {
        const result1 = monkeys[m1]();
        const result2 = monkeys[m2]();
        return typeof result1 === 'function'
            ? result1(result2)
            : result2(result1);
    }
};

for await (const line of rl) {
    setIntoMonkeysMap(monkeyGroups[0], line);
    setIntoMonkeysMap(monkeyGroups[1], line, task2Overrides);
}

monkeyGroups.forEach((group, i) =>
    console.log(`Task ${i} result is: ${group.root()}`)
);