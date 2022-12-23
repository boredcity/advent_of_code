const fs = require('node:fs/promises');

type Direction = 0 | 1 | 2 | 3;
type TurnInstruction = 'L' | 'R';
const nextDirections: Record<TurnInstruction, (dir: Direction) => Direction> = {
    R: x => ((x + 1) % 4) as Direction,
    L: x => ((x + 4 - 1) % 4) as Direction
};

type PosInfo = { rowI: number; colI: number };
type CurrentInfo = PosInfo & { dir: Direction; face: 0 };

const directionValues: Record<Direction, PosInfo> = {
    0: { rowI: 0, colI: 1 },
    1: { rowI: 1, colI: 0 },
    2: { rowI: 0, colI: -1 },
    3: { rowI: -1, colI: 0 }
};

const faceConnections = {
    // TODO:
    0: {
        0: { face: 1, dir: 0 }, // R
        1: { face: 2, dir: 1 }, // D
        2: { face: 3, dir: 0, inverse: true }, // L
        3: { face: 5, dir: 0 } // T
    },
    1: {
        0: { face: 4, dir: 2, inverse: true } // R
        // 1: { face: 2, dir: 1 }, // D
        // 2: { face: 3, dir: 0, inverse: true }, // L
        // 3: { face: 5, dir: 0 } // T
    }
    // 2: {
    //     0: { face: 1, dir: 0 }, // R
    //     1: { face: 2, dir: 1 }, // D
    //     2: { face: 3, dir: 0, inverse: true }, // L
    //     3: { face: 5, dir: 0 } // T
    // },
    // 3: {
    //     0: { face: 1, dir: 0 }, // R
    //     1: { face: 2, dir: 1 }, // D
    //     2: { face: 3, dir: 0, inverse: true }, // L
    //     3: { face: 5, dir: 0 } // T
    // },
    // 4: {
    //     0: { face: 1, dir: 0 }, // R
    //     1: { face: 2, dir: 1 }, // D
    //     2: { face: 3, dir: 0, inverse: true }, // L
    //     3: { face: 5, dir: 0 } // T
    // },
    // 5: {
    //     0: { face: 1, dir: 0 }, // R
    //     1: { face: 2, dir: 1 }, // D
    //     2: { face: 3, dir: 0, inverse: true }, // L
    //     3: { face: 5, dir: 0 } // T
    // },
};

const isEmpty = (str: string) => str === ' ';

async function solve1() {
    const [mapString, pathString]: string[] = (
        await fs.readFile('test-input.txt')
    )
        .toString()
        .split('\n\n');

    const mapRows: string[][] = mapString.split('\n').map(row => row.split(''));
    const colI = mapRows[0].findIndex(cell => cell === '.');
    let cur: CurrentInfo = { rowI: 0, colI, dir: 0, face: 0 };

    for (let i = 0; i < pathString.length; i++) {
        let cmd = pathString[i];

        if (cmd === 'R' || cmd === 'L') {
            cur.dir = nextDirections[cmd](cur.dir);
        } else {
            while (pathString[i + 1] && !'LR'.includes(pathString[i + 1]))
                cmd += pathString[++i];

            const { colI: colIChange, rowI: rowIChange }: PosInfo =
                directionValues[cur.dir];

            for (let i = 0; i < Number.parseInt(cmd); i++) {
                const desiredRowI = cur.rowI + rowIChange;
                const desiredColI = cur.colI + colIChange;
                const desiredCell = mapRows[desiredRowI]?.[desiredColI];
                if (desiredCell === '#') {
                    break;
                } else if (desiredCell === '.') {
                    cur.colI = desiredColI;
                    cur.rowI = desiredRowI;
                } else {
                    let tmpRowI = cur.rowI;
                    let tmpColI = cur.colI;

                    while (
                        (mapRows[tmpRowI - rowIChange]?.[
                            tmpColI - colIChange
                        ] ?? ' ') !== ' '
                    ) {
                        tmpRowI -= rowIChange;
                        tmpColI -= colIChange;
                    }

                    cur.colI = tmpColI;
                    cur.rowI = tmpRowI;
                }
            }
        }
    }
    console.log(1000 * (cur.rowI + 1) + 4 * (cur.colI + 1) + cur.dir);
}

async function solve2() {
    const [mapString, pathString]: string[] = (
        await fs.readFile('test-input.txt')
    )
        .toString()
        .split('\n\n');

    const mapRows: (string | undefined)[][] = mapString
        .split('\n')
        .map(row => row.split(''));
    const colI = mapRows[0].findIndex(cell => cell === '.');
    let cur: CurrentInfo = { rowI: 0, colI, dir: 0, face: 0 };

    const faces: string[][][] = [];
    for (let sectColI = 0; sectColI < mapRows[0].length; sectColI += 50) {
        for (let sectRowI = 0; sectRowI < mapRows.length; sectRowI += 50) {
            if (mapRows[sectRowI][sectColI]) {
                const slicedRow = mapRows.slice(sectRowI, sectRowI + 50);
                const slicedSection = slicedRow.slice(
                    sectColI,
                    sectColI + 50
                ) as string[][];
                faces.push(slicedSection);
            }
        }
    }

    for (let i = 0; i < pathString.length; i++) {
        let cmd = pathString[i];

        if (cmd === 'R' || cmd === 'L') {
            cur.dir = nextDirections[cmd](cur.dir);
        } else {
            while (pathString[i + 1] && !'LR'.includes(pathString[i + 1]))
                cmd += pathString[++i];

            const { colI: colIChange, rowI: rowIChange }: PosInfo =
                directionValues[cur.dir];

            for (let i = 0; i < Number.parseInt(cmd); i++) {
                const desiredRowI = cur.rowI + rowIChange;
                const desiredColI = cur.colI + colIChange;
                const desiredCell = faces[cur.face][desiredRowI]?.[desiredColI];
                if (desiredCell === '#') {
                    break;
                } else if (desiredCell === '.') {
                    cur.colI = desiredColI;
                    cur.rowI = desiredRowI;
                } else {
                    // wrapping
                    let tmpRowI = cur.rowI;
                    let tmpColI = cur.colI;

                    const nextFaceData = cur.face[cur.dir];

                    // cool logic here

                    cur.colI = tmpColI;
                    cur.rowI = tmpRowI;
                }
            }
        }
    }
    console.log(1000 * (cur.rowI + 1) + 4 * (cur.colI + 1) + cur.dir);
}

solve2();
