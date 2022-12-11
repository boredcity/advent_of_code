import { open } from 'node:fs/promises';

const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '/': (a, b) => a / b,
    '*': (a, b) => a * b
};

const examinationBuilder = (left, sign, right) => {
    const first = left === 'old' ? undefined : BigInt(left);
    const second = right === 'old' ? undefined : BigInt(right);
    return function (currentValue) {
        this.inspectedItems++;
        return operations[sign](first ?? currentValue, second ?? currentValue);
    };
};

const dividers = [];
const getThrowTargetBuilder = check => onTrue => onFalse => {
    const divider = BigInt(check.split('Test: divisible by ')[1]);
    dividers.push(divider);
    const trueTarget = BigInt(onTrue.split('If true: throw to monkey ')[1]);
    const falseTarget = BigInt(onFalse.split('If false: throw to monkey ')[1]);
    return value => (value % divider === 0n ? trueTarget : falseTarget);
};

async function findMostTerribleMonkeys(
    turnsTotal,
    isWorryingLoweredOnExamination
) {
    const monkeys = [];
    let currentMonkey = null;

    // collect data
    const file = await open('input.txt');
    for await (const untrimmedLine of file.readLines()) {
        const line = untrimmedLine.trim();

        if (line.startsWith('Monkey')) {
            monkeys.push({ inspectedItems: 0 });
            currentMonkey = monkeys.at(-1);
        } else if (line.startsWith('Starting items: ')) {
            currentMonkey.items = line
                .split('Starting items: ')[1]
                .split(', ')
                .map(item => BigInt(item));
        } else if (line.startsWith('Operation')) {
            currentMonkey.examine = examinationBuilder(
                ...line.split('new = ')[1].split(' ')
            );
        } else if (line.startsWith('Test') || line.startsWith('If')) {
            currentMonkey.getThrowTarget = currentMonkey.getThrowTarget
                ? currentMonkey.getThrowTarget(line)
                : getThrowTargetBuilder(line);
        }
    }
    file.close();
    const lcd = dividers.reduce((acc, d) => d * acc);

    // simulate turns
    for (let currentTurn = 1; currentTurn <= turnsTotal; currentTurn++) {
        for (const monkey of monkeys) {
            const itemStack = monkey.items.reverse();
            while (itemStack.length) {
                const initialWorryLevel = itemStack.pop();
                let newWorryLevel = monkey.examine(initialWorryLevel);
                if (isWorryingLoweredOnExamination) {
                    newWorryLevel = newWorryLevel / 3n;
                }
                const target = monkey.getThrowTarget(newWorryLevel);
                monkeys[target].items.push(newWorryLevel % lcd);
            }
        }
    }

    // get top scorers
    const best = [0, 0];
    for (const { inspectedItems } of monkeys) {
        if (inspectedItems > best[0]) {
            [best[0], best[1]] = [inspectedItems, best[0]];
        } else if (inspectedItems > best[1]) {
            best[1] = inspectedItems;
        }
    }
    return best.reduce((acc, num) => acc * num);
}

const [result1, result2] = await Promise.all([
    findMostTerribleMonkeys(20, true),
    findMostTerribleMonkeys(10_000, false)
]);
console.log(
    `Task 1 answer is: level of monkey business after 20 rounds is ${result1}`
);
console.log(
    `Task 2 answer is: level of monkey business after 10 000 rounds is ${result2}`
);

// Verdict: this is a perfect example of both why people love and why people hate JS
