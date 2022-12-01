import 'dart:io';
import 'dart:convert';

void main() async {
  try {
    final file = File('input.txt');
    final fileStream = file.openRead();
    final linesStream = fileStream.transform(utf8.decoder).transform(LineSplitter());

    var currentElfCalories = 0;
    var max0 = 0;
    var max1 = 0;
    var max2 = 0;

    onElfFullyRead() {
      if (currentElfCalories > max0) {
        max2 = max1;
        max1 = max0;
        max0 = currentElfCalories;
      } else if (currentElfCalories > max1) {
        max2 = max1;
        max1 = currentElfCalories;
      } else if (currentElfCalories > max2) {
        max2 = currentElfCalories;
      }

      currentElfCalories = 0;
    }

    await for (var line in linesStream) line.isNotEmpty
      ? currentElfCalories += int.parse(line)
      : onElfFullyRead();

    onElfFullyRead();

    print('maxCaloriesCarried by 1 elf $max0');
    print('maxCaloriesCarried by 3 elves ${max0 + max1 + max2}');
  } catch (e) {
    print('Error: $e');
  }
}
