import 'dart:io';
import 'dart:convert';

const changesetByDirection = {
  'U': [0, 1],
  'D': [0, -1],
  'L': [-1, 0],
  'R': [1, 0]
};

final file = File('input.txt');

void main() async {
  countVisitedByTail(int snakeLength) async {
    final linesStream = file.openRead().transform(utf8.decoder).transform(LineSplitter());

    var currentSnake = List.generate(snakeLength, (index) => [0, 0]);
    final visitedByTail = Set<String>.from([currentSnake.first.join('/')]);

    await for (var line in linesStream) {
      final instructions = line.split(' ');
      final direction = instructions[0];
      final steps = int.parse(instructions[1]);

      for (var stepI = 0; stepI < steps; stepI++) {
        final headChangeset = changesetByDirection[direction];
        if (headChangeset == null) throw new Exception('Failed to parse command');
        var prevLink = null;
        for (final link in currentSnake) {
          final steps = [0, 0];
          var shouldMove = false;
          for (var i = 0; i < 2; i++) {
            if (prevLink == null) {
              link[i] += headChangeset[i];
            } else {
              final distance = prevLink[i] - link[i];
              steps[i] = distance.sign;
              if (distance.abs() > 1) shouldMove = true;
            }
          }
          if (shouldMove) for (var i = 0; i < 2; i++) link[i] += steps[i];
          prevLink = link;
        }
        visitedByTail.add(currentSnake.last.join('/'));
      }
    }
    return visitedByTail.length;
  }

  try {
    final results = await Future.wait([countVisitedByTail(2), countVisitedByTail(10)]);
    print('Task 1 answer is: tail visited ${results[0]} positions');
    print('Task 2 answer is: tail visited ${results[1]} positions'); // 2408 > x > 2108
  } catch (e) {
    print('Error: $e');
  }
}
