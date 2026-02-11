export function countOffset(detachedElementCache, index) {
  var i = 0,
    offset = 0;
  // TODO: use Map and iterate instead.
  while (i < index) {
    offset += detachedElementCache[i] || 0;
    i++;
  }
  return index + offset;
}
