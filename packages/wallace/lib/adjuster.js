export function countAdjustments(detachedElementCache, index) {
  var adjustment = 0;
  for (var key in detachedElementCache) {
    if (key < index) adjustment += detachedElementCache[key].a;
  }
  return index + adjustment;
}
