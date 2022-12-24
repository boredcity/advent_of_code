const fs = require('node:fs/promises');

type Direction = 0 | 1 | 2 | 3;
type TurnInstruction = 'L' | 'R';
const nextDirections: Record<TurnInstruction, (dir: Direction) => Direction> = {
    R: x => ((x + 1) % 4) as Direction,
    L: x => ((x + 4 - 1) % 4) as Direction
};

type PosInfo = { rowI: number; colI: number };
type CurrentInfo = PosInfo & { dir: Direction; face: number };

const directionValues: Record<Direction, PosInfo> = {
    0: { rowI: 0, colI: 1 },
    1: { rowI: 1, colI: 0 },
    2: { rowI: 0, colI: -1 },
    3: { rowI: -1, colI: 0 }
};

const facePositions = [
    [null, 0, 1],
    [null, 2, null],
    [3, 4, null],
    [5, null, null]
];

const INPUT_FILE_NAME = 'input.txt';
const SIDE_SIZE = 50;
const LAST_I = SIDE_SIZE - 1;

const _dirVisualisation = {
    0: '>',
    1: 'v',
    2: '<',
    3: '^'
};

async function _dumpToFile(cmd: string, faceClones: string[][][]) {
    if ('LR'.includes(cmd)) {
        await fs.appendFile(
            'output.txt',
            ['\n'.repeat(8), cmd].join('\n'.repeat(2))
        );
        return;
    }
    const content = [
        [null, 0, 1],
        [null, 2, null],
        [3, 4, null],
        [5, null, null]
    ]
        .map(rowSections => {
            const sectionsRow = rowSections.reduce((acc, section) => {
                if (section === null) {
                    acc.forEach((_, i) => (acc[i] += ' '.repeat(SIDE_SIZE)));
                } else {
                    faceClones[section].forEach(
                        (rowEls, i) => (acc[i] += rowEls.join(''))
                    );
                }
                acc.forEach((_, i) => (acc[i] += '    '));
                return acc;
            }, Array.from<string>({ length: SIDE_SIZE }).fill(''));
            return sectionsRow.join('\n') + '\n'.repeat(4);
        })
        .join('\n');

    await fs.appendFile(
        'output.txt',
        ['\n'.repeat(8), cmd, content].join('\n'.repeat(2))
    );
}

const getNextTileOnAnotherFace: Record<
    number,
    Record<Direction, (rowI: number, colI: number) => CurrentInfo>
> = {
    0: {
        0: (r, c) => ({ face: 1, dir: 0, rowI: r, colI: 0 }),
        1: (r, c) => ({ face: 2, dir: 1, rowI: 0, colI: c }),
        2: (r, c) => ({ face: 3, dir: 0, rowI: LAST_I - r, colI: 0 }),
        3: (r, c) => ({ face: 5, dir: 0, rowI: c, colI: 0 })
    },
    1: {
        0: (r, c) => ({ face: 4, dir: 2, rowI: LAST_I - r, colI: LAST_I }),
        1: (r, c) => ({ face: 2, dir: 2, rowI: c, colI: LAST_I }),
        2: (r, c) => ({ face: 0, dir: 2, rowI: r, colI: LAST_I }),
        3: (r, c) => ({ face: 5, dir: 3, rowI: LAST_I, colI: c })
    },
    2: {
        0: (r, c) => ({ face: 1, dir: 3, rowI: LAST_I, colI: r }),
        1: (r, c) => ({ face: 4, dir: 1, rowI: 0, colI: c }),
        2: (r, c) => ({ face: 3, dir: 1, rowI: 0, colI: r }),
        3: (r, c) => ({ face: 0, dir: 3, rowI: LAST_I, colI: c })
    },
    3: {
        0: (r, c) => ({ face: 4, dir: 0, rowI: r, colI: 0 }),
        1: (r, c) => ({ face: 5, dir: 1, rowI: 0, colI: c }),
        2: (r, c) => ({ face: 0, dir: 0, rowI: LAST_I - r, colI: 0 }),
        3: (r, c) => ({ face: 2, dir: 0, rowI: c, colI: 0 })
    },
    4: {
        0: (r, c) => ({ face: 1, dir: 2, rowI: LAST_I - r, colI: LAST_I }),
        1: (r, c) => ({ face: 5, dir: 2, rowI: c, colI: LAST_I }),
        2: (r, c) => ({ face: 3, dir: 2, rowI: r, colI: LAST_I }),
        3: (r, c) => ({ face: 2, dir: 3, rowI: LAST_I, colI: c })
    },
    5: {
        0: (r, c) => ({ face: 4, dir: 3, rowI: LAST_I, colI: r }),
        1: (r, c) => ({ face: 1, dir: 1, rowI: 0, colI: c }),
        2: (r, c) => ({ face: 0, dir: 1, rowI: 0, colI: r }),
        3: (r, c) => ({ face: 3, dir: 3, rowI: LAST_I, colI: c })
    }
};

async function solve1() {
    const [mapString, pathString]: string[] = (
        await fs.readFile(INPUT_FILE_NAME)
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
    return 1000 * (cur.rowI + 1) + 4 * (cur.colI + 1) + cur.dir;
}

async function solve2() {
    await fs.writeFile('output.txt', '');
    const [mapString, pathString]: string[] = (
        await fs.readFile(INPUT_FILE_NAME)
    )
        .toString()
        .split('\n\n');

    const mapRows: (string | undefined)[][] = mapString
        .split('\n')
        .map(row => row.split(''));

    let cur: CurrentInfo = { rowI: 0, colI: 0, dir: 0, face: 0 };

    const faces: string[][][] = [];

    for (let sectRowI = 0; sectRowI < mapRows.length; sectRowI += SIDE_SIZE) {
        for (
            let sectColI = 0;
            sectColI < mapRows[sectRowI].length;
            sectColI += SIDE_SIZE
        ) {
            if ((mapRows[sectRowI]?.[sectColI] ?? ' ') !== ' ') {
                const slicedSection = mapRows
                    .slice(sectRowI, sectRowI + SIDE_SIZE)
                    .map(row =>
                        row.slice(sectColI, sectColI + SIDE_SIZE)
                    ) as string[][];
                faces.push(slicedSection);
            }
        }
    }

    const faceClones: string[][][] = JSON.parse(JSON.stringify(faces));

    let prevCmd: string | null = null;
    const debudRangeI = [0, 0];
    for (let i = 0; i < pathString.length; i++) {
        const isDebug = i >= debudRangeI[0] && i < debudRangeI[1];
        if (isDebug) {
            await _dumpToFile(prevCmd!, faceClones);
            console.log(
                `i ${i} - cmd: ${prevCmd}\n`,
                cur,
                'LR'.includes(prevCmd!)
                    ? ''
                    : [
                          '0123456789'.repeat(5).split(''),
                          ...faceClones[cur.face]
                      ].map((r, i) => r.join('') + `| ${i - 1}`)
            );
        }
        let cmd = pathString[i];
        while (
            !'LR'.includes(cmd) &&
            pathString[i + 1] &&
            !'LR'.includes(pathString[i + 1])
        )
            cmd += pathString[++i];

        prevCmd = cmd;

        if (cmd === 'R' || cmd === 'L') {
            cur.dir = nextDirections[cmd](cur.dir);
            faceClones[cur.face][cur.rowI][cur.colI] =
                _dirVisualisation[cur.dir];
        } else {
            for (let i = 0; i < Number.parseInt(cmd); i++) {
                const { colI: colIChange, rowI: rowIChange }: PosInfo =
                    directionValues[cur.dir];
                const desiredRowI = cur.rowI + rowIChange;
                const desiredColI = cur.colI + colIChange;
                const desiredCell = faces[cur.face][desiredRowI]?.[desiredColI];
                // console.log(i, desiredCell);
                if (desiredCell === '#') {
                    break;
                } else if (desiredCell === '.') {
                    cur.rowI = desiredRowI;
                    cur.colI = desiredColI;

                    faceClones[cur.face][cur.rowI][cur.colI] = `${
                        (i + 1) % 10
                    }`;
                } else {
                    const next = getNextTileOnAnotherFace[cur.face][cur.dir](
                        cur.rowI,
                        cur.colI
                    );

                    isDebug &&
                        console.log({
                            cur,
                            desiredCell: `"${desiredCell}" (${cur.face}/${desiredRowI}/${desiredColI})`,
                            next,
                            f: [
                                '0123456789'.repeat(5).split(''),
                                ...faceClones[cur.face]
                            ].map((r, i) => r.join('') + `| ${i - 1}`)
                        });

                    if (faces[next.face][next.rowI]?.[next.colI] === '#') break;
                    Object.assign(cur, next);

                    faceClones[cur.face][cur.rowI][cur.colI] = `${
                        (i + 1) % 10
                    }`;
                }
            }
        }
    }

    let rowOffset = 0;
    let colOffset = 0;
    for (let rI = 0; rI < facePositions.length; rI++) {
        for (let cI = 0; cI < facePositions[rI].length; cI++) {
            if (facePositions[rI][cI] === cur.face) {
                rowOffset = rI * SIDE_SIZE;
                colOffset = cI * SIDE_SIZE;
            }
        }
    }

    return (
        1000 * (cur.rowI + rowOffset + 1) +
        4 * (cur.colI + colOffset + 1) +
        cur.dir
    );
}

(async function main() {
    const [r1, r2] = await Promise.all([solve1(), solve2()]);
    console.log(`Task 1 result: ${r1}`);
    console.log(`Task 2 result: ${r2}`);
})();

// Broke solution to part 1 again :/