neighbouring_offsets = [[0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0], [1, 0, 0], [-1, 0, 0]]


def get_key(x, y, z):
    return '/'.join([str(dim) for dim in [x, y, z]])


class Dimensions:
    def __init__(self, x: int | float, y: int | float, z: int | float):
        self.x = x
        self.y = y
        self.z = z

    def replace_if_bigger(self, x: int | float, y: int | float, z: int | float):
        self.x = max(x, self.x)
        self.y = max(y, self.y)
        self.z = max(z, self.z)

    def replace_if_smaller(self, x: int | float, y: int | float, z: int | float):
        self.x = min(x, self.x)
        self.y = min(y, self.y)
        self.z = min(z, self.z)

    def every_is_smaller_than(self, other, adjust):
        own = self.get_as_list()
        for i in range(len(own)):
            if (own[i] + adjust) > other[i]:
                return False
        return True

    def every_is_bigger_than(self, other, adjust):
        own = self.get_as_list()
        for i in range(len(own)):
            if (own[i] + adjust) < other[i]:
                return False
        return True

    def get_as_list(self):
        return [self.x, self.y, self.z]


def bfs(sx, sy, sz, ground_set, min_dims, max_dims):
    val = 0
    queue = [[sx, sy, sz]]
    visited = set()
    visited.add(get_key(*queue[0]))

    while len(queue) > 0:
        sx, sy, sz = queue.pop(0)
        for [_x, _y, _z] in neighbouring_offsets:
            x = sx + _x
            y = sy + _y
            z = sz + _z
            key = get_key(x, y, z)
            if (key in visited) or \
                (key in ground_set) or \
                not min_dims.every_is_smaller_than([x, y, z], -2) or \
                    not max_dims.every_is_bigger_than([x, y, z], 2):
                visited.add(key)
                if key in ground_set:
                    val += 1
            else:
                visited.add(key)
                queue.append([x, y, z])

    return val


def main() -> None:
    min_dim = Dimensions(float("inf"), float("inf"), float("inf"))
    max_dim = Dimensions(float("-inf"), float("-inf"), float("-inf"))
    with open("input.txt", encoding="utf8") as fp:
        occupied_set = set()
        visible_sides = 0
        for cube_str in fp.readlines():
            x, y, z = [int(d) for d in cube_str.split(',')]
            max_dim.replace_if_bigger(x, y, z)
            min_dim.replace_if_smaller(x, y, z)
            visible_sides += 6
            key = get_key(x, y, z)
            occupied_set.add(key)
            for [_x, _y, _z] in neighbouring_offsets:
                key = get_key(x+_x, y+_y, z+_z)
                if key in occupied_set:
                    visible_sides -= 2

        print(f'Task 1 solution is: {visible_sides} are exposed to air')

        outside_visible_sides = bfs(*[d - 1 for d in min_dim.get_as_list()], occupied_set, min_dim, max_dim)
        print(f'Task 2 solution is: {outside_visible_sides} are exposed to air from outside')


if __name__ == "__main__":
    main()
