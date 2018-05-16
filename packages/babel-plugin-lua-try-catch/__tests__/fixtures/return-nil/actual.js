(() => {
  try {
    throw new Error();
  } catch {
    return null;
  } finally {
    return undefined;
  }

  console.log('unreachable code');
})();
