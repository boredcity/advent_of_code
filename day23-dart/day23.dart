import "dart:core";
import 'dart:io';
import 'dart:math';

final desiredAdjustments = [
  Position(-1, 0, alias: 'N'),
  Position(1, 0, alias: 'S'),
  Position(0, -1, alias: 'W'),
  Position(0, 1, alias: 'E'),
];

class Position {
  final int rowI;
  final int colI;
  final String? alias;
  const Position(int this.rowI, int this.colI, {String? this.alias});

  Position movedBy(Position adjustment) => Position(rowI + adjustment.rowI, colI + adjustment.colI);

  bool canMove(Position direction, Set<Position> others) {
    for (final crossAxis in [-1, 0, 1]) {
      final posToCheck = Position(
        rowI + (direction.rowI == 0 ? crossAxis : direction.rowI),
        colI + (direction.colI == 0 ? crossAxis : direction.colI),
      );
      if (others.contains(posToCheck)) return false;
    }
    return true;
  }

  bool hasNeighbours(Set<Position> others) => !desiredAdjustments.every((dir) => canMove(dir, others));

  @override
  bool operator ==(Object other) => other is Position && other.colI == colI && other.rowI == rowI;

  @override
  String toString() => alias ?? "Pos($rowI/$colI)";

  @override
  int get hashCode => Object.hash(rowI.hashCode, colI.hashCode);
}

List<Position> getEdgeCoords(Set<Position> elves) {
  return elves.fold<List<Position>>([
    Position(double.maxFinite.toInt(), double.maxFinite.toInt()),
    Position(-double.maxFinite.toInt(), -double.maxFinite.toInt()),
  ], (best, cur) {
    return [
      Position(min(best[0].rowI, cur.rowI), min(best[0].colI, cur.colI)),
      Position(max(best[1].rowI, cur.rowI), max(best[1].colI, cur.colI))
    ];
  });
}

void main() async {
  final lines = (await File('input.txt').readAsString()).split('\n');
  var elves = Set<Position>();

  for (var rowI = 0; rowI < lines.length; rowI++)
    for (var colI = 0; colI < lines[0].length; colI++) if (lines[rowI][colI] == '#') elves.add(Position(rowI, colI));

  var i = 0;
  while (true) {
    final desiredPositions = Map<Position, Set<Position>>();
    var someMoved = false;
    for (final elf in elves) {
      if (!elf.hasNeighbours(elves)) {
        desiredPositions[elf] = Set()..add(elf);
        continue;
      }

      var dirI = i;
      var moved = false;
      while (dirI < (i + desiredAdjustments.length)) {
        var elfAdj = desiredAdjustments[dirI % desiredAdjustments.length];
        if (elf.canMove(elfAdj, elves)) {
          desiredPositions.putIfAbsent(elf.movedBy(elfAdj), Set.new).add(elf);
          moved = true;
          break;
        }
        dirI++;
      }
      if (moved) {
        someMoved = true;
      } else {
        desiredPositions[elf] = Set()..add(elf);
      }
    }

    if (i == 9) {
      final minMax = getEdgeCoords(elves);
      final min = minMax[0];
      final max = minMax[1];
      final emptyTilesCount = (max.rowI - min.rowI + 1) * (max.colI - min.colI + 1) - elves.length;
      print("Task 1 result: rectangle contains ${emptyTilesCount} empty tiles");
    }

    if (!someMoved) {
      print("Task 2 result: elves stopped moving during round ${i + 1}");
      break;
    }

    elves = Set<Position>();
    for (final entry in desiredPositions.entries) {
      entry.value.length == 1 ? elves.add(entry.key) : elves.addAll(entry.value);
    }

    i++;
  }
}

// For debugging:

void _syncDrawField(Set<Position> elves, {bool toFile = false}) {
  final file = toFile ? File('output.txt') : null;
  final minMax = getEdgeCoords(elves);
  for (var rowI = minMax[0].rowI; rowI <= minMax[1].rowI; rowI++) {
    var line = '';
    for (var colI = minMax[0].colI; colI <= minMax[1].colI; colI++) {
      line += elves.contains(Position(rowI, colI)) ? '#' : '.';
    }
    if (toFile) {
      file?.writeAsStringSync('${line}\n', mode: FileMode.append);
    } else {
      print(line);
    }
  }
}
