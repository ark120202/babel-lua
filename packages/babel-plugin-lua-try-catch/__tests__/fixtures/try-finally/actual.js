try {
  throw new Error();
} finally {
  console.log('finally');
}
