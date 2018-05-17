(() => {
  try {
    throw new Error();
  } catch {
    return 'not returned';
  } finally {
    return 'returned';
  }

  return 'not returned';
})();
