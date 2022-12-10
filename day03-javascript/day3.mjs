import { open } from 'node:fs/promises';

const file = await open('input.txt');

const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

let task1TotalScore = 0;
let task2TotalScore = 0;
const getScoreForTask2 = genGetScoreForTask2();
getScoreForTask2.next();
for await (const line of file.readLines()) {
    task1TotalScore += getScoreForTask1(line);
    task2TotalScore += getScoreForTask2.next(line).value;
}

function getScoreForTask1(line) {
    const halfLen = line.length / 2;
    const firstHalf = line.slice(0, halfLen);
    const set = new Set(firstHalf.split(''));
    for (let i = halfLen; i < line.length; i++) {
        const letter = line[i];
        if (set.has(letter)) {
            return alphabet.indexOf(letter) + 1;
        }
    }
}

function* genGetScoreForTask2() {
    let result = 0;
    while (true) {
        const sets = [];
        const line1 = yield result;
        sets.push(new Set(line1.split('')));
        const line2 = yield 0;
        sets.push(new Set(line2.split('')));
        const line3 = yield 0;
        for (let i = 0; i < line3.length; i++) {
            const letter = line3[i];
            if (sets.every(set => set.has(letter))) {
                result = alphabet.indexOf(letter) + 1;
                break;
            }
        }
    }
}

console.log(`Score for task 1 is ${task1TotalScore}`);
console.log(`Score for task 2 is ${task2TotalScore}`);

// Verdict: JS, oh sweet JS; terrible with sets (there is a new proposal to add intersects, btw), but perfect for quickly hacking stuff together :) Using generator functions still feels odd even after all those years writing Redux Sagas (although no-one sensible would use one here anyway)
