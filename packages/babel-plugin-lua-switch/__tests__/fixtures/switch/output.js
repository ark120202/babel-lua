do {
  let _switchValue = getValue();
  let _results = [
    get(1),
    2,
    3,
    4
  ]

  if (_switchValue === _results[0]) {
    print(1);
  }

  if (_switchValue === _results[0] || _switchValue === _results[1]) {
    print('2 (or 1 if already printed)');
    break;
  }

  if (_switchValue === _results[2] || _switchValue === _results[3]) {
    print('3 or 4');
  }

  if (!_results.includes(_switchValue)) print('>4 or not an integer');
} while (false);
