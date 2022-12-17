import "dart:core";
import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;

const startingTunnel = 'AA';

extension IterableWithMaxMethod on Iterable<int> {
  int get max => reduce(math.max);
}

class TunnelCandidate {
  final List<String> neighbours;
  final int rate;
  final String name;

  const TunnelCandidate(this.name, this.rate, this.neighbours);
}

class Pair<F, S> {
  final F el0;
  final S el1;
  const Pair(this.el0, this.el1);
}

class Tunnel {
  final List<Pair<String, int>> travelOptions;
  final int rate;
  final String name;

  const Tunnel(this.name, this.rate, this.travelOptions);

  @override
  String toString() {
    return "(${name} (${rate}): ${this.travelOptions.map((o) => "${o.el0}-${o.el1}").toList()})";
  }
}

void main() async {
  final file = File('input.txt');
  final linesStream = file.openRead().transform(utf8.decoder).transform(LineSplitter());

  final tunnelCandidatesMap = <String, TunnelCandidate>{};
  await for (var line in linesStream) {
    final re = RegExp(r'Valve (?<name>\w+) has flow rate=(?<rate>\d+); tunnels? leads? to valves? (?<neighbours>.+)$');
    final match = re.firstMatch(line);
    if (match == null) throw Exception('Couldn\'t parse input');
    final name = match.namedGroup('name')!;
    final rate = int.parse(match.namedGroup('rate')!);
    final neighbours = (match.namedGroup('neighbours'))!.split(', ');
    tunnelCandidatesMap[name] = TunnelCandidate(name, rate, neighbours);
  }

  final usefulTunnelNames = tunnelCandidatesMap.values.where((t) => t.rate > 0).map((t) => t.name).toList()
    ..add(startingTunnel);

  int bfs(String origin, String target) {
    final visited = Set<String>();
    final queue = <Pair<String, int>>[Pair(origin, 0)];
    while (true) {
      final cur = queue.removeAt(0);
      if (visited.contains(cur.el0)) continue;
      visited.add(cur.el0);
      final tunnel = tunnelCandidatesMap[cur.el0]!;
      if (tunnel.name == target) return cur.el1;
      for (final n in tunnel.neighbours) {
        queue.add(Pair(n, cur.el1 + 1));
      }
    }
  }

  final tunnelsMap = <String, Tunnel>{};

  for (final candidate in usefulTunnelNames) {
    final cur = tunnelCandidatesMap[candidate]!;
    final travelOptions = <Pair<String, int>>[];
    for (final other in usefulTunnelNames) {
      if (candidate == other) continue;
      travelOptions.add(Pair(other, bfs(candidate, other)));
    }
    tunnelsMap[cur.name] = Tunnel(cur.name, cur.rate, travelOptions);
  }

  getVisitedString(String tunnelName, int turnsLeft, int earned) {
    return '${tunnelName}-${turnsLeft}-${earned}';
  }

  int dfs(
    String tunnelName,
    int turnsLeft,
    int earned,
    Set<String> opened,
    Set<String> visited,
  ) {
    if (turnsLeft <= 0) return earned;
    if (opened.length == usefulTunnelNames.length) return earned;

    final key = getVisitedString(tunnelName, turnsLeft, earned);
    if (visited.contains(key)) return -1;
    visited.add(key);

    final cur = tunnelsMap[tunnelName]!;
    return [
      for (final neighbourData in cur.travelOptions)
        if (!opened.contains(neighbourData.el0))
          dfs(
            neighbourData.el0,
            turnsLeft - neighbourData.el1,
            earned,
            opened,
            visited,
          ),
      if (!opened.contains(tunnelName))
        dfs(
          tunnelName,
          turnsLeft - 1,
          earned + ((turnsLeft - 1) * cur.rate),
          Set.from(opened)..add(tunnelName),
          visited,
        ),
      0
    ].max;
  }

  final result1 = dfs(startingTunnel, 30, 0, Set()..add(startingTunnel), Set<String>());

  print("Task 1 result is: the best result for 1 person is ${result1}");

  final workDivisionOptions = usefulSubsets(usefulTunnelNames.where((n) => n != startingTunnel).toList());

  final result2 = workDivisionOptions.fold<int>(0, (best, firstTargets) {
    final ignoreSet1 = Set<String>.from(firstTargets)..add(startingTunnel);
    final ignoreSet2 = Set<String>.from(usefulTunnelNames.where((name) => !firstTargets.contains(name)))
      ..add(startingTunnel);

    final first = dfs(startingTunnel, 26, 0, ignoreSet1, Set<String>());
    final second = dfs(startingTunnel, 26, 0, ignoreSet2, Set<String>());

    return math.max(best, first + second);
  });

  print("Task 2 result is: the best result for 1 person and a trained elephant is ${[result1, result2].max}");
}

Iterable<Set<String>> usefulSubsets(List<String> list) sync* {
  final compliments = Set<String>();
  var subsetCount = 1 << list.length;
  for (var i = 0; i < subsetCount; i++) {
    final option = {
      for (var j = 0, bit = 1; j < list.length; j++, bit <<= 1)
        if (i & bit != 0) list[j]
    };
    if (!option.isEmpty && option.length != list.length) {
      final key = (option.toList()..sort()).join('');
      if (compliments.contains(key)) {
        continue;
      }
      final complimentKey = (list.where((el) => !option.contains(el)).toList()..sort()).join('');
      compliments.add(complimentKey);
      yield option;
    }
  }
}

// Verdict: well, the second part sucks :/ takes 527 seconds to run...