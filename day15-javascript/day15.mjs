import { open } from 'node:fs/promises';

const file = await open('input.txt');
let maxX = -Infinity;
let minX = Infinity;

let pairs = [];
for await (const line of file.readLines()) {
    const [sensorX, sensorY, beaconX, beaconY] = line
        .match(/(-?\d+)/g)
        .map(Number);
    const sensor = { x: sensorX, y: sensorY };
    const beacon = { x: beaconX, y: beaconY };
    const mDistanceRadius = getMDistance(sensor, beacon);
    maxX = Math.max(maxX, sensorX + mDistanceRadius, beaconX);
    minX = Math.min(minX, sensorX - mDistanceRadius, beaconX);
    pairs.push({ sensor, beacon, mDistanceRadius });
}

function getMDistance(pos1, pos2) {
    const distanceX = Math.abs(pos1.x - pos2.x);
    const distanceY = Math.abs(pos1.y - pos2.y);
    return distanceX + distanceY;
}

function solveTask1(targetY) {
    let affected = 0;
    for (let x = minX; x <= maxX; x++) {
        for (const { mDistanceRadius, sensor, beacon } of pairs) {
            const currentCell = { y: targetY, x };

            if (
                getMDistance(currentCell, sensor) <= mDistanceRadius &&
                !(beacon.x === x && beacon.y === targetY)
            ) {
                affected++;
                break;
            }
        }
    }

    return affected;
}

const signsCombinations = [
    [-1, -1],
    [1, 1],
    [-1, 1],
    [1, -1]
];
function findEmptyCell(pairs, rightBoundary) {
    for (const { mDistanceRadius, sensor } of pairs) {
        for (let i = 0; i <= mDistanceRadius + 1; i++) {
            const parts = [i, mDistanceRadius - i + 1];
            outer: for (const [xSign, ySign] of signsCombinations) {
                const cellPos = {
                    x: sensor.x + parts[0] * xSign,
                    y: sensor.y + parts[1] * ySign
                };
                if (
                    ![cellPos.x, cellPos.y].every(
                        pos => pos >= 0 && pos <= rightBoundary
                    )
                )
                    continue;
                for (const { mDistanceRadius, sensor } of pairs) {
                    if (getMDistance(cellPos, sensor) < mDistanceRadius)
                        continue outer;
                }
                return cellPos;
            }
        }
    }
}

const target1 = 2_000_000;
const task1Result = solveTask1(target1);
console.log(
    `Task 1 answer is: ${task1Result} positions cannot contain a beacon`
);

const boundary = 4_000_000;
const findEmptyCellResult = findEmptyCell(pairs, boundary);
if (findEmptyCellResult) {
    const { x, y } = findEmptyCellResult;
    const task2Result = x * 4_000_000 + y;
    console.log(`Task 2 answer is: tuning frequency is ${task2Result}`);
}
