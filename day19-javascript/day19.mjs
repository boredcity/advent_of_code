import { open } from 'node:fs/promises';

const getResourcesTemplate = () => ({
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0
});

function getMinPotential(robots, resources, minutesLeft) {
    return robots.geode * minutesLeft + resources.geode;
}

class Memo {
    data = new Set();

    constructor(minutes) {
        this.bestMinPotentialsByMinutesLeft = Array.from({
            length: minutes
        }).fill(0);
    }

    getMemoKey(robots, resources, minutesLeft) {
        let str = `${minutesLeft}`;
        for (const type of Object.keys(robots)) {
            str += `|${type}:rob${robots[type]}/res${resources[type]}`;
        }
        return str;
    }

    markTested(robots, resources, minutesLeft) {
        const projectedGeodes = getMinPotential(robots, resources, minutesLeft);
        for (let i = 0; i < minutesLeft; i++) {
            if (this.bestMinPotentialsByMinutesLeft[i] < projectedGeodes) {
                this.bestMinPotentialsByMinutesLeft[i] = projectedGeodes;
            }
        }
        this.data.add(this.getMemoKey(robots, resources, minutesLeft));
    }

    wasTested(robots, resources, minutesLeft) {
        if (
            this.bestMinPotentialsByMinutesLeft[minutesLeft] >
            getMinPotential(robots, resources, minutesLeft)
        ) {
            return true;
        }
        return this.data.has(this.getMemoKey(robots, resources, minutesLeft));
    }
}

function getBestResult(
    robots,
    currentResources,
    minutesLeft,
    costs,
    maxNeededResources,
    memo
) {
    if (minutesLeft === 0) return currentResources.geode;

    if (memo.wasTested(robots, currentResources, minutesLeft)) return 0;

    const alternatives = [];
    let canBuildTypesCount = 0;
    for (const [robotType, resourcesRequired] of Object.entries(costs)) {
        const newResources = { ...currentResources };
        let canBuild = true;
        for (const [resourceType, count] of Object.entries(resourcesRequired)) {
            newResources[resourceType] -= count;
            if (newResources[resourceType] < 0) {
                canBuild = false;
                break;
            }
        }
        if (canBuild) canBuildTypesCount++;

        const shouldBuild =
            robotType === 'geode' ||
            robots[robotType] < maxNeededResources[robotType];
        if (!canBuild || !shouldBuild) continue;

        for (const [resourceType, count] of Object.entries(robots))
            newResources[resourceType] += count;

        const newRobots = { ...robots, [robotType]: robots[robotType] + 1 };

        const newMinutesLeft = minutesLeft - 1;

        if (memo.wasTested(newRobots, newResources, newMinutesLeft)) continue;

        alternatives.push(
            getBestResult(
                newRobots,
                newResources,
                newMinutesLeft,
                costs,
                maxNeededResources,
                memo
            )
        );
    }
    if (canBuildTypesCount < Object.keys(robots).length) {
        const newResources = { ...currentResources };
        for (const [resourceType, count] of Object.entries(robots))
            newResources[resourceType] += count;

        const newRobots = robots;
        const newMinutesLeft = minutesLeft - 1;
        if (!memo.wasTested(newRobots, newResources, newMinutesLeft)) {
            alternatives.push(
                getBestResult(
                    robots,
                    newResources,
                    minutesLeft - 1,
                    costs,
                    maxNeededResources,
                    memo
                )
            );
        }
    }

    const result = Math.max(...alternatives);

    memo.markTested(robots, currentResources, minutesLeft);
    return result;
}

function getLineInfo(line) {
    const matched = line
        .match(
            /Blueprint (\d+): Each ore robot costs (\d+) ore. Each clay robot costs (\d+) ore. Each obsidian robot costs (\d+) ore and (\d+) clay. Each geode robot costs (\d+) ore and (\d+) obsidian./
        )
        .slice(1)
        .map(n => Number.parseInt(n));
    const [
        blueprintIndex,
        oreCostOre,
        oreCostClay,
        oreCostObsidian,
        clayCostObsidian,
        geodeCostOre,
        geodeCostObsidian
    ] = matched;
    const costs = {
        ore: { ore: oreCostOre },
        clay: { ore: oreCostClay },
        obsidian: { ore: oreCostObsidian, clay: clayCostObsidian },
        geode: { ore: geodeCostOre, obsidian: geodeCostObsidian }
    };

    const robots = {
        ...getResourcesTemplate(),
        ore: 1
    };

    const resources = getResourcesTemplate();

    const maxNeededResources = Object.values(costs).reduce(
        (acc, robotCosts) => {
            Object.entries(robotCosts).forEach(
                ([type, cost]) => (acc[type] = Math.max(acc[type], cost))
            );
            return acc;
        },
        getResourcesTemplate()
    );

    return { blueprintIndex, robots, resources, maxNeededResources, costs };
}

async function solve1() {
    let totalQualityLevel = 0;
    const file = await open('input.txt');
    let i = 0;
    for await (const line of file.readLines()) {
        const { blueprintIndex, robots, resources, maxNeededResources, costs } =
            getLineInfo(line);
        const result = getBestResult(
            robots,
            resources,
            24,
            costs,
            maxNeededResources,
            new Memo(24)
        );
        totalQualityLevel += result * blueprintIndex;
    }
    return totalQualityLevel;
}

async function solve2() {
    let task2Solution = 1;
    let i = 0;
    const file = await open('input.txt');
    for await (const line of file.readLines()) {
        if (i++ === 3) break;
        const { robots, resources, maxNeededResources, costs } =
            getLineInfo(line);

        const result = getBestResult(
            robots,
            resources,
            32,
            costs,
            maxNeededResources,
            new Memo(32)
        );
        task2Solution *= result;
    }
    return task2Solution;
}

const solutions = await Promise.all([solve1(), solve2()]);

console.log(`Task 1 solution is: quality level is ${solutions[0]}`);
console.log(`Task 2 solution is: ${solutions[1]}`);

// Broke the first part solving the second :/
