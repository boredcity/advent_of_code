from collections import defaultdict

SHOW_DEBUG_LOGS = True  # log turn, trip leg, memo object size and queue length
STORE_HISTORY_SLOW = False  # every expedition will store it's path and every step's snapshot


class FieldBound:
    @staticmethod
    def get_location_key_for_coords(row_i, col_i):
        return f'{row_i}/{col_i}'

    def __init__(self, row_i, col_i, ver_len, hor_len):
        self.hor_len = hor_len
        self.row_i = row_i
        self.col_i = col_i
        self.ver_len = ver_len

    def set_within_borders(self):
        if self.col_i == 0:
            self.col_i = self.hor_len - 2
        elif self.col_i == self.hor_len - 1:
            self.col_i = 1
        if self.row_i == 0:
            self.row_i = self.ver_len - 2
        elif self.row_i == self.ver_len - 1:
            self.row_i = 1

    def get_location_key(self):
        return FieldBound.get_location_key_for_coords(self.row_i, self.col_i)

    def __repr__(self):
        return self.get_location_key()


class Blizzard(FieldBound):
    def __init__(self, row_i, col_i, dir, ver_len, hor_len):
        super().__init__(row_i, col_i, ver_len, hor_len)
        self.dir = dir

    def move(self):
        if self.dir == 'v':
            self.row_i += 1
        elif self.dir == '^':
            self.row_i -= 1
        elif self.dir == '>':
            self.col_i += 1
        elif self.dir == '<':
            self.col_i -= 1
        self.set_within_borders()


class Expedition(FieldBound):
    def __init__(self, row_i, col_i, turn, ver_len, hor_len, borders, blizzards_by_turns, path=[], snapshot=None):
        super().__init__(row_i, col_i, ver_len, hor_len)
        self.turn = turn
        self.borders = borders
        self.path = path
        self.snapshot = snapshot
        self.blizzards_by_turns = blizzards_by_turns

    def get_next_turn_blizzard_locations(self):
        return self.blizzards_by_turns[(self.turn + 1) % len(self.blizzards_by_turns)]

    def get_next_options(self):
        blizzard_locations = self.get_next_turn_blizzard_locations()
        adjustments = [
            (row_adj, col_adj)
            for row_adj in range(-1, 2)
            for col_adj in range(-1, 2)
            if (row_adj == 0 or col_adj == 0)
        ]

        options = []

        for (row_adj, col_adj) in adjustments:
            new_row_i = self.row_i + row_adj
            new_col_i = self.col_i + col_adj
            key = FieldBound.get_location_key_for_coords(new_row_i, new_col_i)
            if (key in self.borders or len(blizzard_locations[key]) > 0 or new_row_i < 0):
                continue
            options.append(
                Expedition(
                    new_row_i,
                    new_col_i,
                    self.turn + 1,
                    self.ver_len,
                    self.hor_len,
                    self.borders,
                    self.blizzards_by_turns,
                    (self.path + [self]) if STORE_HISTORY_SLOW else [],
                    self.get_snapshot(new_row_i, new_col_i) if STORE_HISTORY_SLOW else None
                )
            )

        return options

    def get_snapshot(self, new_row_i, new_col_i):
        blizzard_locations = self.get_next_turn_blizzard_locations()
        next_key = FieldBound.get_location_key_for_coords(new_row_i, new_col_i)
        snapshot = ''
        for row_i in range(0, self.ver_len):
            line = ""
            for col_i in range(0, self.hor_len):
                key = FieldBound.get_location_key_for_coords(row_i, col_i)
                blizzards_here = len(blizzard_locations[key])
                if key == next_key:
                    line += 'E'
                elif key in self.borders:
                    line += '#'
                elif blizzards_here > 0:
                    line += str(blizzards_here) if blizzards_here > 1 else list(blizzard_locations[key])[0]
                else:
                    line += '.'
            snapshot += f"{line}\n"
        return snapshot

    def get_memo_key(self):
        return self.turn % len(self.blizzards_by_turns) + self.col_i * 1_000 + self.row_i * 1_000_000

    def __repr__(self):
        return f"{super().__repr__()} - turn {self.turn}"


def main() -> None:
    with open("input.txt", encoding="utf8") as fp:
        blizzards = set()
        borders = set()
        start = None
        end = None
        lines = fp.read().split('\n')
        ver_len = len(lines)
        hor_len = len(lines[0])
        for row_i in range(len(lines)):
            for col_i in range(len(lines[row_i])):
                cur = lines[row_i][col_i]
                if cur == '#':
                    borders.add(FieldBound(row_i, col_i, ver_len, hor_len).get_location_key())
                else:
                    if cur == '.':
                        if not start:
                            start = (row_i, col_i)
                    else:
                        blizzards.add(Blizzard(row_i, col_i, cur, ver_len, hor_len))

                    end = (row_i, col_i)

    end_location_key = FieldBound.get_location_key_for_coords(*end)
    start_location_key = FieldBound.get_location_key_for_coords(*start)
    target_location_key = end_location_key

    blizzards_by_turns = []

    while True:
        blizzard_locations = defaultdict(lambda: set())
        found_cycle = True
        for b in blizzards:
            key = b.get_location_key()
            if not (len(blizzards_by_turns) > 0 and key in blizzards_by_turns[0]):
                found_cycle = False

            b.move()
            blizzard_locations[key].add(b.dir)
        if found_cycle:
            break
        blizzards_by_turns.append(blizzard_locations)

    queue = [
        Expedition(
            *start, 0, ver_len, hor_len, borders, blizzards_by_turns
        )]

    handled = set()
    trip_leg_index = 0
    cur_turn = 0

    while len(queue) > 0:
        cur = queue.pop(0)

        if SHOW_DEBUG_LOGS:
            if (cur.turn > cur_turn):
                print(f'turn {cur.turn} trip {trip_leg_index} h: {len(handled)} q: {len(queue)}')
                cur_turn = cur.turn

        if cur.get_location_key() == target_location_key:
            if trip_leg_index == 0:
                print(f"Task 1 result: {cur.turn} minutes")
                target_location_key = start_location_key

            elif trip_leg_index == 1:
                if SHOW_DEBUG_LOGS:
                    print("Made it back")
                target_location_key = end_location_key

            elif trip_leg_index == 2:
                print(f"Task 2 result: {cur.turn} minutes")
                break

            handled = set()
            trip_leg_index += 1
            queue = []

        for option in cur.get_next_options():
            memo_key = option.get_memo_key()
            if memo_key in handled:
                continue
            handled.add(memo_key)
            queue.append(option)


if __name__ == "__main__":
    main()
