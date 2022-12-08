import { open } from 'node:fs/promises';
import { join } from 'node:path';

// flat object of all directories using full path as a key
const dirs = {};
// stack of directories leading to current dir
let dirsStack = [];

const file = await open('input.txt');
// O(n) time, O(d) space where d is number of directories
for await (const line of file.readLines()) {
    const splitLine = line.split(' ');
    if (splitLine[0] === '$') {
        const [_, commandName, argument] = splitLine;
        if (commandName === 'ls') {
            dirs[join(...dirsStack)] = { filesSize: 0, subdirectories: [] };
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
            dirs[join(...dirsStack)].subdirectories.push(dirName);
        } else {
            const [fileSizeStr, _fileName] = splitLine;
            dirs[join(...dirsStack)].filesSize += +fileSizeStr;
        }
    }
}

// O(d) time, O(d) space where d is number of directories
function dfsUpdateDirSize(pathToDir) {
    const dir = dirs[pathToDir];
    dir.dirSize = dir.subdirectories.reduce((acc, subdirectoryName) => {
        const pathToSubdirectory = join(pathToDir, subdirectoryName);
        dfsUpdateDirSize(pathToSubdirectory);
        return acc + dirs[pathToSubdirectory].dirSize;
    }, dir.filesSize);
}
dfsUpdateDirSize('/');

let smallDirsTotalSize = 0;
const rootDirInfo = { dirName: '/', dirSize: dirs['/'].dirSize };
const memoryAvailable = 70_000_000 - rootDirInfo.dirSize;
const memoryToFree = 30_000_000 - memoryAvailable;
let currentBestSolution = rootDirInfo;

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