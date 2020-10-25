switch (getValue()) {
  case get(1):
    print(1);
  case 2:
    print('2 (or 1 if already printed)');
    break;
  case 3:
  case 4:
    print('3 or 4');
  default:
    print('>4 or not an integer');
}
