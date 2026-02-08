export function countAdjustments(detachedElementCache, index) {
  var i = 0,
    adjustment = 0;
  // TODO: use Map and iterate instead.
  while (i < index) {
    adjustment += detachedElementCache[i] || 0;
    i++;
  }
  return index + adjustment;
}
