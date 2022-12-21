import fs from 'node:fs';
import readline from 'node:readline';

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '/': (a, b) => a / b,
    '*': (a, b) => a * b
};

function reverseOperation(sign, first, second, result) {
    const isFirstFunc = typeof first === 'function';
    switch (sign) {
        case '+': {
            return isFirstFunc
                ? first(result - second)
                : second(result - first);
        }
        case '-': {
            return isFirstFunc
                ? first(result + second)
                : second(first - result);
        }
        case '/': {
            return isFirstFunc
                ? first(result * second)
                : second(first / result);
        }
        case '*': {
            return isFirstFunc
                ? first(result / second)
                : second(result / first);
        }
    }
}

(async function solve1() {
    const rl = readline.createInterface({
        input: fs.createReadStream('input.txt')
    });
    const monkeys = Object.create(null);
    for await (const line of rl) {
        const [name, work] = line.split(': ');
        const [m1, sign, m2] = work.split(' ');
        const fn = !sign
            ? () => Number.parseInt(work)
            : () => operations[sign](monkeys[m1](), monkeys[m2]());
        monkeys[name] = fn;
    }
    console.log(`Task 1 result is: ${monkeys.root()}`);
})();

(async function solve2() {
    const rl = readline.createInterface({
        input: fs.createReadStream('test-input.txt')
    });
    const monkeys = Object.create(null);
    for await (const line of rl) {
        const [name, work] = line.split(': ');
        const [m1, sign, m2] = work.split(' ');

        let fn;
        if (name === 'humn') {
            fn = () => x => x;
        } else if (name === 'root') {
            fn = () => {
                const result1 = monkeys[m1]();
                const result2 = monkeys[m2]();
                if (typeof result1 === 'function') return result1(result2);
                if (typeof result2 === 'function') return result2(result1);
                throw Error('root monkey received wrong types of data');
            };
        } else {
            fn = !sign
                ? () => Number.parseInt(work)
                : () => {
                      const results = [monkeys[m1](), monkeys[m2]()];
                      if (results.some(r => typeof r === 'function')) {
                          return target =>
                              reverseOperation(sign, ...results, target);
                      }
                      return operations[sign](...results);
                  };
        }

        monkeys[name] = fn;
    }
    console.log(`Task 2 result is: ${monkeys.root()}`);
})();
