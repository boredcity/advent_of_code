import { open } from 'node:fs/promises';

// O(n) time, O(n) space
async function main() {
    const file = await open('input.txt');
    const forest: string[] = (await file.readFile()).toString().split('\n');
    await file.close();

    const visibility: number[][] = forest.map(
        row => Array.from({ length: row.length }).fill(0) as number[]
    );

    const scenicScore: number[][] = forest.map(
        row => Array.from({ length: row.length }).fill(1) as number[]
    );

    // Horizontal scans
    for (let rowI = 0; rowI < forest.length; rowI++) {
        const row = forest[rowI];
        const lastTreeIndex = row.length - 1;

        // Left to right
        let lastSeenTreeIndexByTreeSize = Array.from({ length: 9 }).fill(
            0
        ) as number[];
        let maxHiddenTreeHeightLeft = -1;
        for (let treeI = 0; treeI < row.length; treeI++) {
            const tree = +row[treeI];
            if (tree > maxHiddenTreeHeightLeft) {
                visibility[rowI][treeI] = 1;
                maxHiddenTreeHeightLeft = tree;
            }
            const treeScenicScore = lastSeenTreeIndexByTreeSize
                .slice(tree)
                .reduce(
                    (currentWorstScore, blockingTreeIndex) =>
                        Math.min(currentWorstScore, treeI - blockingTreeIndex),
                    treeI
                );
            scenicScore[rowI][treeI] *= treeScenicScore;
            lastSeenTreeIndexByTreeSize[tree] = treeI;
        }

        // Right to left
        lastSeenTreeIndexByTreeSize = Array.from({ length: 9 }).fill(
            lastTreeIndex
        ) as number[];
        let maxHiddenTreeHeightRight = -1;
        for (let treeI = lastTreeIndex; treeI >= 0; treeI--) {
            const tree = +row[treeI];
            if (tree > maxHiddenTreeHeightRight) {
                visibility[rowI][treeI] = 1;
                maxHiddenTreeHeightRight = tree;
            }

            const treeScenicScore = lastSeenTreeIndexByTreeSize
                .slice(tree)
                .reduce(
                    (currentWorstScore, blockingTreeIndex) =>
                        Math.min(currentWorstScore, blockingTreeIndex - treeI),
                    lastTreeIndex - treeI
                );
            scenicScore[rowI][treeI] *= treeScenicScore;
            lastSeenTreeIndexByTreeSize[tree] = treeI;
        }
    }

    // Vertical scans
    let visibleTreesCount = 0;
    let maxScenicScore = 1;
    for (let treeI = 0; treeI < forest[0].length; treeI++) {
        const lastRowIndex = forest.length - 1;

        // Top to bottom
        let lastSeenTreeIndexByTreeSize = Array.from({ length: 9 }).fill(
            0
        ) as number[];
        let maxHiddenTreeHeightTop = -1;
        for (let rowI = 0; rowI < forest.length; rowI++) {
            const tree = +forest[rowI][treeI];
            if (tree > maxHiddenTreeHeightTop) {
                visibility[rowI][treeI] = 1;
                maxHiddenTreeHeightTop = tree;
            }

            const treeScenicScore = lastSeenTreeIndexByTreeSize
                .slice(tree)
                .reduce(
                    (currentWorstScore, blockingTreeIndex) =>
                        Math.min(currentWorstScore, rowI - blockingTreeIndex),
                    rowI
                );
            scenicScore[rowI][treeI] *= treeScenicScore;
            lastSeenTreeIndexByTreeSize[tree] = rowI;
        }

        // Bottom to top
        lastSeenTreeIndexByTreeSize = Array.from({ length: 9 }).fill(
            lastRowIndex
        ) as number[];
        let maxHiddenTreeHeightBottom = -1;
        for (let rowI = forest.length - 1; rowI >= 0; rowI--) {
            const tree = +forest[rowI][treeI];
            if (tree > maxHiddenTreeHeightBottom) {
                visibility[rowI][treeI] = 1;
                maxHiddenTreeHeightBottom = tree;
            }

            const treeScenicScore = lastSeenTreeIndexByTreeSize
                .slice(tree)
                .reduce(
                    (currentWorstScore, blockingTreeIndex) =>
                        Math.min(currentWorstScore, blockingTreeIndex - rowI),
                    lastRowIndex - rowI
                );
            scenicScore[rowI][treeI] *= treeScenicScore;
            lastSeenTreeIndexByTreeSize[tree] = rowI;

            // Calculate results
            if (visibility[rowI][treeI]) visibleTreesCount += 1;
            const totalTreeScore = scenicScore[rowI][treeI];
            if (totalTreeScore > maxScenicScore) {
                maxScenicScore = totalTreeScore;
            }
        }
    }

    console.log(
        `Task 1 answer is: there are ${visibleTreesCount} visible trees in the forest`
    );
    console.log(`Task 2 answer is: the best scenic score is ${maxScenicScore}`);
}

main();
