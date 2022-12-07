import { open } from 'node:fs/promises';
import path from 'node:path';

const file = await open('input.txt');

// flat object of all directories using full path as a key
const dirs = {};

// stack of directories leading to current dir
let dirsStack = [];

const getDirName = () =>
    dirsStack.join('/').slice(dirsStack.length === 1 ? 0 : 1);

const getInitialDirState = () => ({ filesSize: 0, subdirectories: [] });

// O(n) time, O(d) space where d is number of directories
for await (const line of file.readLines()) {
    const splitLine = line.split(' ');
    if (splitLine[0] === '$') {
        const [_, commandName, argument] = splitLine;
        if (commandName === 'ls') {
            dirs[getDirName()] = getInitialDirState();
        } else if (commandName === 'cd') {
            switch (argument) {
                case '..':
                    dirsStack.pop();
                    break;
                case '/':
                    dirsStack = ['/'];
                    break;
                default:
                    dirsStack.push(argument);
                    break;
            }
        } else {
            throw new Error(`Unknown command "${commandName}"`);
        }
    } else {
        if (line.startsWith('dir')) {
            const [_dirType, dirName] = splitLine;
            dirs[getDirName()].subdirectories.push(dirName);
        } else {
            const [fileSizeStr, _fileName] = splitLine;
            dirs[getDirName()].filesSize += +fileSizeStr;
        }
    }
}

const getFullSubdirectoryName = (pathToDir, subdirectoryName) =>
    `${pathToDir === '/' ? '' : pathToDir}/${subdirectoryName}`;

// O(d) time, O(d) space where d is number of directories
function dfsGetSize(pathToDir) {
    const dir = dirs[pathToDir];
    // not a huge fan of:
    // a) doing it recursively
    // b) mutating objects as I do it
    // probably would've refactored the code if I had a bit more time
    dir.dirSize = dir.subdirectories.reduce(
        (acc, subdirectoryName) =>
            acc +
            dfsGetSize(getFullSubdirectoryName(pathToDir, subdirectoryName)),
        dir.filesSize
    );
    return dir.dirSize;
}

let smallDirsTotalSize = 0;
const totalUsedSpace = dfsGetSize('/');
const memoryAvailable = 70_000_000 - totalUsedSpace;
const memoryToFree = 30_000_000 - memoryAvailable;
let currentBestSolution = {
    dirName: '/',
    dirSize: totalUsedSpace
};

// O(d) time where d is number of directories, O(1) space
for (const [dirName, { dirSize }] of Object.entries(dirs)) {
    if (dirSize <= 100_000) smallDirsTotalSize += dirSize;
    if (dirSize < memoryToFree) {
        continue;
    }
    if (dirSize < currentBestSolution.dirSize) {
        currentBestSolution = { dirName, dirSize };
    }
}

console.log(
    `Task 1 answer is: total size of small directories is ${smallDirsTotalSize}`
);
console.log(
    `Task 2 answer is: remove "${currentBestSolution.dirName}" to empty ${
        currentBestSolution.dirSize
    } (freeing just ${currentBestSolution.dirSize - memoryToFree} extra)`
);

// Verdict: ok, now we're getting serious :)
// All the other tasks might end up being written in JS, TS or Dart :/
// Total: O(n) time, O(d) space where d is number of directories