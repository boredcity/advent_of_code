from typing import Callable

AIR = '.'
STONE = '#'
SAND = 'o'
SOURCE = '+'

SOURCE_ROW_I = 0
SOURCE_COL_I = 500


class TaskSolver:

    def __init__(self, figures: list[list[list[int]]], matrix_rows_len: int, matrix_cols_len: int):
        self.matrix = [
            [AIR for _ in range(matrix_cols_len * 2)]
            for _ in range(matrix_rows_len)
        ]
        self.matrix[SOURCE_ROW_I][SOURCE_COL_I] = SOURCE

        self.paint_figures(figures)

    def is_valid_move(self, matrix: list[list[str]], row_i: int, col_i: int) -> bool:
        return (
            row_i >= 0 and row_i < len(matrix) and
            col_i >= 0 and col_i < len(matrix[0]) and
            matrix[row_i][col_i] == AIR
        )

    def paint_figures(self, figures: list[list[list[int]]]):
        for figure in figures:
            prev_coord_pair: list[int] | None = None
            for col_i, row_i in figure:
                self.matrix[row_i][col_i] = STONE
                if prev_coord_pair is not None:
                    prev_col_i, prev_row_i = prev_coord_pair
                    if prev_col_i != col_i:
                        for new_col_i in range(col_i, prev_col_i, get_sign(prev_col_i - col_i)):
                            self.matrix[row_i][new_col_i] = STONE
                    elif prev_row_i != row_i:
                        for new_row_i in range(row_i, prev_row_i, get_sign(prev_row_i - row_i)):
                            self.matrix[new_row_i][col_i] = STONE
                prev_coord_pair = [col_i, row_i]

    def solve_for(
        self,
        check_exit_condition: Callable[[int, str], bool]
    ):
        matrix_copy = [row[:] for row in self.matrix]

        cur_unit_index = 0
        cur_row_i = SOURCE_ROW_I
        cur_col_i = SOURCE_COL_I

        while not check_exit_condition(
            cur_row_i,
            matrix_copy[cur_row_i][cur_col_i]
        ):
            starting_row = cur_row_i

            for direction in [0, -1, 1]:
                option = [cur_row_i + 1, cur_col_i + direction]
                if self.is_valid_move(matrix_copy, *option):
                    cur_row_i, cur_col_i = option
                    break
            else:
                matrix_copy[cur_row_i][cur_col_i] = SAND
                cur_unit_index += 1
                cur_row_i = SOURCE_ROW_I
                cur_col_i = SOURCE_COL_I

        return cur_unit_index


def get_sign(val): return int(val / abs(val))


def main() -> None:
    with open("input.txt", encoding="utf8") as fp:
        max_row_i = 0
        max_col_i = 0
        figures: list[list[list[int]]] = []
        for figure_str in fp.readlines():
            figure_data: list[list[int]] = []
            for pair_str in figure_str.split(' -> '):
                col_i, row_i = [int(coord) for coord in pair_str.split(',')]
                max_col_i = max(max_col_i, col_i)
                max_row_i = max(max_row_i, row_i)
                figure_data.append([col_i, row_i])
            figures.append(figure_data)

        task = TaskSolver(figures, max_row_i + 2, max_col_i + 1)
        result1 = task.solve_for(lambda row_i, _:   row_i == max_row_i + 1)
        result2 = task.solve_for(lambda row_i, val: row_i == 0 and val != SOURCE)
        print(f'Task 1 solution is: unit {result1} and every one after it goes into the void')
        print(f'Task 2 solution is: unit {result2} blocks the source')

if __name__ == "__main__":
    main()
