import re
from collections import defaultdict


def mover1(state, count, from_index, to_index):
    for _ in range(count):
        crate = state[from_index].pop()
        state[to_index].append(crate)


def mover2(state, count, from_index, to_index):
    from_row = state[from_index]
    moved = from_row[-count:]
    to_row = state[to_index]

    state[from_index] = from_row[:-count]
    state[to_index] = to_row + moved


def solve_task(mover_function):
    with open("input.txt") as fp:
        state = defaultdict(list)
        line_length = None
        while True:
            line = fp.readline()
            # EOF
            if not line:
                break

            # moves
            if line.startswith('move'):
                args = re.search(r'move (\d+) from (\d+) to (\d+)', line)
                count,\
                    from_row,\
                    to_row = (int(arg) for arg in args.groups())
                mover_function(state, count, from_row - 1, to_row - 1)
                continue

            # in between crates and moves

            if line.startswith(' 1'):
                continue

            if line == "\n":
                for key, value in state.items():
                    value.reverse()
                continue

            # crates
            line_crates = re.findall(r'\s{0,1}([\w]|\s{3})\s{0,1}', line)

            if line_length == None:
                line_length = len(line_crates)

            for (index, crate) in enumerate(line_crates):
                if len(crate) == 1:
                    state[index].append(crate)

        return ''.join([state[index][-1] for index in range(line_length)])


print(f"First task's answer is {solve_task(mover1)}")
print(f"Second task's answer is {solve_task(mover2)}")

# Verdict: Python is cool if you really love indenting stuff
# I don't love ".join" syntax, but that's mostly it.
# RegExps are cool, but I have to google a cheatsheet each time I use them :D
