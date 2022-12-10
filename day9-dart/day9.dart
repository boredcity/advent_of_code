import 'dart:io';
import 'dart:convert';

void main() async {
  countVisitedByTail(int snakeLength) async {
    final file = File('input.txt');
    final linesStream = file.openRead().transform(utf8.decoder).transform(LineSplitter());

    var currentSnake = List.generate(snakeLength, (index) => [0, 0]);
    final visitedByTail = Set<String>.from([currentSnake.first.join('/')]);

    final changesetByDirection = {
      'U': [0, 1],
      'D': [0, -1],
      'L': [-1, 0],
      'R': [1, 0],
    };

    await for (var line in linesStream) {
      final instructions = line.split(' ');
      final direction = instructions[0];
      final steps = int.parse(instructions[1]);

      for (var stepI = 0; stepI < steps; stepI++) {
        final headChangeset = changesetByDirection[direction];
        if (headChangeset == null) throw new Exception('Failed to parse command');

        var prevLink = currentSnake[0];
        for (final link in currentSnake) {
          if (link == prevLink) {
            // head
            link[0] += headChangeset[0];
            link[1] += headChangeset[1];
          } else {
            final distanceX = prevLink[0] - link[0];
            final distanceY = prevLink[1] - link[1];
            final stepX = distanceX != 0 ? distanceX ~/ distanceX.abs() : 0;
            final stepY = distanceY != 0 ? distanceY ~/ distanceY.abs() : 0;

            if (distanceX.abs() > 1 || distanceY.abs() > 1) {
              link[0] += stepX;
              link[1] += stepY;
            }
          }
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
