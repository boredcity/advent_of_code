const events = require('node:events');
const fs = require('node:fs');
const readline = require('node:readline');

type NestedArray<T> = (T | NestedArray<T>)[];
type NestedArrayValue<T> = NestedArray<T> | T;

function compare(
    el1: NestedArrayValue<number | undefined>,
    el2: NestedArrayValue<number | undefined>
): number {
    let curEl1 = el1;
    let curEl2 = el2;
    if (typeof curEl1 === 'number' && typeof curEl2 === 'number') {
        if (curEl1 !== curEl2) {
            return curEl1 < curEl2 ? -1 : 1;
        }
        return 0;
    }

    if (Array.isArray(curEl1) !== Array.isArray(curEl2)) {
        typeof curEl1 === 'number' ? (curEl1 = [curEl1]) : (curEl2 = [curEl2]);
    }

    if (Array.isArray(curEl1) && Array.isArray(curEl2)) {
        for (let i = 0; i < curEl1.length; i++) {
            if (curEl2[i] === undefined) break;
            const result = compare(curEl1[i], curEl2[i]);
            if (result !== 0) return result;
        }
        if (curEl1.length !== curEl2.length)
            return curEl1.length < curEl2.length ? -1 : 1;
        return 0;
    }
    return 0;
}

(async function main() {
    try {
        const rl = readline.createInterface({
            input: fs.createReadStream('input.txt')
        });

        const results: (boolean | undefined)[] = [];
        const allLines: NestedArray<number> = [];
        for await (const line of rl) {
            if (line.length === 0) {
                const [el1, el2] = allLines.slice(-2);
                results.push(compare(el1, el2) === -1);
            } else {
                allLines.push(JSON.parse(line.trim()));
            }
        }

        const sumOfIndices = results.reduce(
            (acc, val, i) => acc + (val ? i + 1 : 0),
            0
        );

        const dividers = [[[2]], [[6]]];
        allLines.push(...dividers);
        allLines.sort(compare);
        const decoderKey = dividers.reduce(
            (acc, d) => acc * (allLines.indexOf(d) + 1),
            1
        );

        console.log(`Task 1 answer is ${sumOfIndices}`);
        console.log(`Task 2 answer is ${decoderKey}`);
    } catch (err) {
        console.error(err);
    }
})();
