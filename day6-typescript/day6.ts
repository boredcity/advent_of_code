import { open } from 'node:fs/promises';

async function main() {
    const file = await open('input.txt');
    const string = (await file.readFile()).toString();

    function getStartIndex(str: string, distinctCount: number) {
        const firstIndexOffset = distinctCount - 1;
        const letters = str.split('');
        for (let i = 0; i < letters.length; i++) {
            const set = new Set(
                letters.slice(i - firstIndexOffset, i + 1).filter(Boolean)
            );
            if (set.size === distinctCount) return i + 1;
        }
    }

    console.log(
        `First suitable index for task 1 is ${getStartIndex(string, 4)}`
    );
    console.log(
        `First suitable index for task 1 is ${getStartIndex(string, 14)}`
    );
    file.close();
}

main();

// Verdict: TS, just to avoid resorting to JS again.
// Nothing really fancy (and nothing complex enough to justify using types),
// but it's nice to be able to run it with just `npx ts-node`
// with reasonable default configuration.
