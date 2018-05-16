(() => {
  try {
    throw new Error();
  } catch {
    return;
  }

  console.log('unreachable code');
})();
