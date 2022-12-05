import re
from collections import defaultdict


def solve_task(crate_mover_model):
    with open("input.txt") as fp:
        state = defaultdict(list)
        line_length = None
        while True:
            line = fp.readline()
            if not line:
                break

            if line.startswith('move'):
                args = re.search(r'move (\d+) from (\d+) to (\d+)', line)
                count, _from_index, _to_index = (int(arg) for arg in args.groups())
                from_index = _from_index - 1
                to_index = _to_index - 1

                from_row = state[from_index]
                moved = from_row[-count:]
                to_row = state[to_index]
                step = 1 if crate_mover_model == 9001 else -1

                state[from_index] = from_row[:-count]
                state[to_index] = to_row + moved[::step]
                continue

            if line.startswith(' 1'):
                found = re.search(r'(?P<last_row_index>\d+)\s$', line)
                line_length = int(found.group('last_row_index'))
                continue

            if line == "\n":
                for key, value in state.items():
                    value.reverse()
                continue

            line_crates = re.findall(r'\s{0,1}([\w]|\s{3})\s{0,1}', line)
            for (index, crate) in enumerate(line_crates):
                if len(crate) == 1:
                    state[index].append(crate)

        return ''.join([state[index][-1] for index in range(line_length)])

print(f"First task's answer is {solve_task(9000)}")
print(f"Second task's answer is {solve_task(9001)}")

# Verdict: Python is cool if you really love indenting stuff
# I don't love ".join" syntax, but that's mostly it.
# RegExps are cool, but I have to google a cheatsheet each time I use them :D
