import "dart:core";
import 'dart:io';

class NumberInfo {
  final int initialIndex;
  final int val;
  const NumberInfo(
    int this.initialIndex,
    int trueValue,
    int decryptionKey,
  ) : this.val = decryptionKey * trueValue;

  @override
  String toString() {
    return val.toString();
  }
}

runFullCycle(List<NumberInfo> indexedNumbers) {
  final numbersCount = indexedNumbers.length;
  for (var i = 0; i < numbersCount; i++) {
    final startingIndex = indexedNumbers.indexWhere((info) => info.initialIndex == i);
    final val = indexedNumbers.removeAt(startingIndex);
    var newIndex = (startingIndex + val.val) % (numbersCount - 1);
    indexedNumbers.insert(newIndex, val);
  }
}

Future<int> solve({int decryptionKey = 1, int cycles = 1}) async {
  final file = await File('input.txt').readAsString();
  final indexedNumbers = file
      .split('\n')
      .asMap()
      .entries
      .map(
        (pair) => NumberInfo(
          pair.key,
          int.parse(pair.value),
          decryptionKey,
        ),
      )
      .toList();

  while (cycles-- > 0) runFullCycle(indexedNumbers);

  final zeroIndex = indexedNumbers.indexWhere((info) => info.val == 0);
  return [1000, 2000, 3000].fold<int>(
    0,
    (sum, x) => sum + indexedNumbers[(zeroIndex + x) % indexedNumbers.length].val,
  );
}

main() async {
  final results = await Future.wait([
    solve(),
    solve(decryptionKey: 811589153, cycles: 10),
  ]);
  print("Task 1 solution is: ${results[0]}");
  print("Task 2 solution is: ${results[1]}");
}
