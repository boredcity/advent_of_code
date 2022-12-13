import 'dart:io';
import 'dart:convert';

class AreaToCheck {
  final int rowI;
  final int colI;
  final List<String> map;
  final List<AreaToCheck> history;

  get maxRowI {
    return this.map.length - 1;
  }

  get maxColI {
    return this.map[0].length - 1;
  }

  AreaToCheck(this.map, this.rowI, this.colI, this.history);

  int get stepsTaken {
    return history.length;
  }

  String get letter {
    return map[rowI][colI];
  }

  int get height {
    String str = letter;
    if (str == 'S') str = 'a';
    if (str == 'E') str = 'z';
    return str.codeUnits[0];
  }

  Iterable<AreaToCheck> getClimbableNeighbours(bool Function(AreaToCheck area) checker) {
    List<List<int>> options = [];
    if (rowI + 1 <= maxRowI) options.add([rowI + 1, colI]);
    if (rowI - 1 >= 0) options.add([rowI - 1, colI]);
    if (colI + 1 <= maxColI) options.add([rowI, colI + 1]);
    if (colI - 1 >= 0) options.add([rowI, colI - 1]);
    final res = options
        .map((coords) => AreaToCheck(map, coords[0], coords[1], [...history, this]))
        .where((area) => checker(area));
    return res;
  }

  @override
  bool operator ==(Object o) => o is AreaToCheck && o.rowI == rowI && o.colI == colI;

  int get hashCode => Object.hash(rowI, colI);

  @override
  String toString() {
    return "(Pos: ${rowI}/${colI})";
  }
}

findBestPath(AreaToCheck origin, String targetLetter) {
  final visited = Set<AreaToCheck>();
  final queue = [origin];
  AreaToCheck? destinationArea;
  while (queue.length > 0) {
    final current = queue.removeAt(0);
    if (current.letter == targetLetter) {
      destinationArea = current;
      break;
    } else {
      for (final neighbour
          in current.getClimbableNeighbours((area) => !visited.contains(area) && area.height >= current.height - 1)) {
        queue.add(neighbour);
        visited.add(neighbour);
      }
    }
  }
  return destinationArea?.stepsTaken;
}

void main() async {
  final file = File('input.txt');
  final linesStream = file.openRead().transform(utf8.decoder).transform(LineSplitter());
  final map = <String>[];
  late final AreaToCheck finalPosition;

  await for (var row in linesStream) {
    final rowI = map.length;
    for (var colI = 0; colI < row.length; colI++) {
      if (row[colI] == 'E') finalPosition = AreaToCheck(map, rowI, colI, []);
    }
    map.add(row);
  }

  print("Task 1 answer is: ${findBestPath(finalPosition, 'S')} steps");
  print("Task 2 answer is: ${findBestPath(finalPosition, 'a')} steps");
}
