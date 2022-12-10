import { open } from 'node:fs/promises';

// I gave up on writing the second part in Rockstar, so here it is in plain js

const file = await open('input.txt');

let task1TotalScore = 0;
let task2TotalScore = 0;
for await (const line of file.readLines()) {
    const [elf1Sections, elf2Sections] = line
        .split(',')
        .map(pair => pair.split('-').map(str => Number.parseInt(str)));

    if (isOverlapping(elf1Sections, elf2Sections)) task2TotalScore++;
}

function isOverlapping([thisStart, thisEnd], [otherStart, otherEnd]) {
    return (
        (thisStart <= otherEnd && otherStart <= thisEnd) ||
        (thisStart >= otherEnd && otherStart >= thisEnd)
    );
}

console.log(`Score for task 2 is ${task2TotalScore}`);
