with open("input.txt") as fp:
    result = 0
    value = 1
    index = 1
    screen = ''

    summing = None

    while True:
        is_summing = summing != None
        # Plan work for cycle
        if not is_summing:
            line = fp.readline()
            if (not line):
                break
            if line.startswith('addx'):
                summing = int(line.split(' ')[1])

        if (index - 20) % 40 == 0:
            result += value * index

        h_index = (index - 1) % 40
        if h_index == 0:
            screen += '\n'
        screen += '🎅' if h_index in range(value - 1, value + 2) else '🎄'

        # Do work for cycle
        if is_summing:
            value += summing
            summing = None

        index += 1

print(f'Task 1 result is {result}')
print(f'Task 2 result is {screen}')
