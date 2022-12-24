const fs = require('node:fs/promises');
main().catch(err => console.error(err));
type RockLines = [number, number][];

const isDebug = false;
const CHAMBER_WIDTH = 7;

class Rock {
    public lines: RockLines;
    public left: number = 2;
    public bottom: number = 3;
    public width: number = 0;
    public height: number = 0;
    public isPlaced: boolean = false;

    public get right() {
        return this.left + this.width - 1;
    }

    public get top() {
        return this.bottom + this.height - 1;
    }

    constructor(lines: RockLines) {
        this.lines = lines.reverse();
        for (const [_, r] of lines) if (r >= this.width) this.width = r + 1;
        this.height = lines.length;
    }

    has(key: string) {
        const [y, x] = key.split('/').map(part => Number.parseInt(part));
        const adjustedLines = this.lines.reduce((acc, l, i) => {
            acc[this.bottom + i] = l.map(coord => coord + this.left);
            return acc;
        }, {} as Record<number, number[]>);
        const aLine = adjustedLines[x];
        if (aLine) {
            const [l, r] = aLine;
            return y >= l && y <= r;
        }
    }

    reset(highestRow: number) {
        this.left = 2;
        this.bottom = highestRow + 3;
        this.isPlaced = false;
    }

    moveSideways(windDirection: string, set: Set<string>) {
        const desiredMove = windDirection === '<' ? -1 : 1;
        if (
            (desiredMove === -1 && this.left === 0) ||
            (desiredMove === 1 && this.right === CHAMBER_WIDTH - 1)
        ) {
            return;
        }
        for (let i = 0; i < this.height; i++) {
            const [colL, colR] = this.lines[i];
            const rowI = this.bottom + i;
            const boundary = this.left + (desiredMove === -1 ? colL : colR);
            if (set.has(`${boundary + desiredMove}/${rowI}`)) {
                return;
            }
        }
        this.left += desiredMove;
    }

    place(set: Set<string>) {
        for (let rowI = 0; rowI < this.height; rowI++) {
            const trueRowI = this.bottom + rowI;
            const [l, r] = this.lines[rowI];
            for (let colI = this.left + l; colI <= this.left + r; colI++) {
                set.add(`${colI}/${trueRowI}`);
            }
        }
        this.isPlaced = true;
    }

    moveDown(set: Set<string>) {
        for (let i = 0; i < this.height; i++) {
            const [colL, colR] = this.lines[i];
            const rowI = this.bottom + i;
            for (let j = colL; j <= colR; j++) {
                const colI = j + this.left;
                if (set.has(`${colI}/${rowI - 1}`)) return this.place(set);
            }
        }
        this.bottom -= 1;
    }
}

async function main() {
    const [WINDS, ROCKS] = (
        await Promise.all([
            fs.readFile('input-winds.txt'),
            fs.readFile('input-rocks.txt')
        ])
    ).map(txt => txt.toString().trim());
    const rocks: Rock[] = [];
    for (const rockLine of ROCKS.split('\n\n')) {
        const rockLines: RockLines = []; // left, right
        for (const line of rockLine.split('\n')) {
            rockLines.push([line.indexOf('#'), line.lastIndexOf('#')]);
        }
        rocks.push(new Rock(rockLines));
    }

    console.log(
        `Task 1 result: highest row index is ${findTowerHeight(
            rocks,
            WINDS,
            2022
        )}`
    );
    console.log(
        `Task 2 result: highest row index is ${findTowerHeight(
            rocks,
            WINDS,
            1_000_000_000_000
        )}`
    );
}

function vizualize(set: Set<string>, currentRock: Rock, highestRow: number) {
    const visualization: string[] = [];
    for (let x = -1; x <= highestRow + 7; x++) {
        let line = '';
        for (let y = 0; y < CHAMBER_WIDTH; y++) {
            let char = '.';
            if (currentRock.has(`${y}/${x}`)) {
                char = '@';
            }
            if (set.has(`${y}/${x}`)) {
                char = '#';
            }
            line += char;
        }
        visualization.push(line + `| ${x}`);
    }
    for (const l of visualization.reverse()) {
        console.log(l);
    }
}

function findTowerHeight(
    rocks: Rock[],
    winds: String,
    untillFigureIsPlaced: number
) {
    let currentFigureIndex = 0;
    let highestRow = 0;
    let rocksPlaced = 0;

    rocks[0].reset(highestRow);
    const chamberWidthArr = Array.from({ length: CHAMBER_WIDTH });
    let set = new Set(chamberWidthArr.map((_, i) => `${i}/-1`));
    const seenPatterns = new Map<
        string,
        {
            rocksPlaced: number;
            highestRow: number;
        }
    >();
    let rowRepeat = 0;

    let i = 0;
    let cycleFound = false;
    while (true) {
        const currentRock = rocks[currentFigureIndex];

        if (currentRock.isPlaced) {
            if (currentRock.top + 1 > highestRow)
                highestRow = currentRock.top + 1;
            isDebug && console.log('PLACED', { highestRow });
            currentFigureIndex = (currentFigureIndex + 1) % rocks.length;
            const newRock = rocks[currentFigureIndex];
            newRock.reset(highestRow);
            isDebug && vizualize(set, newRock, highestRow);
            if (++rocksPlaced === untillFigureIsPlaced) break;

            if (cycleFound) continue;

            let patternKey = `${i}-${currentFigureIndex}`;
            for (let r = highestRow - 1; r > highestRow - 6; r--) {
                patternKey += chamberWidthArr
                    .map((_, i) => (set.has(`${i}/${r}`) ? '#' : '.'))
                    .join('');
            }
            const seen = seenPatterns.get(patternKey);
            isDebug && console.log(`Checking pattern "${patternKey}"`, !!seen);
            if (!seen) {
                seenPatterns.set(patternKey, { rocksPlaced, highestRow });
            } else {
                const { rocksPlaced: prevPlaced, highestRow: prevHighest } =
                    seen;
                const rocksDiff = rocksPlaced - prevPlaced;
                const cycleRepeats =
                    Math.floor(
                        (untillFigureIsPlaced - prevPlaced) / rocksDiff
                    ) - 1;

                isDebug &&
                    console.log(
                        `Found cycle found with pattern "${patternKey}" repeating ${cycleRepeats} for ${rocksDiff} figures`
                    );
                rowRepeat += cycleRepeats * (highestRow - prevHighest);
                rocksPlaced += cycleRepeats * rocksDiff;
                cycleFound = true;
            }
            continue;
        }
        const windDirection = winds[i];

        isDebug &&
            console.log({
                windDirection,
                rockType: currentFigureIndex
            });

        currentRock.moveSideways(windDirection, set);
        currentRock.moveDown(set);
        isDebug &&
            console.log({
                bottom: currentRock.bottom,
                left: currentRock.left,
                right: currentRock.right
            });

        isDebug && vizualize(set, currentRock, highestRow);
        i = (i + 1) % winds.length;
    }
    return highestRow + rowRepeat;
}
