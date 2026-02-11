export function countOffset(detachedElementCache, index) {
  let offset = 0;
  for (let [key, value] of detachedElementCache.entries()) {
    if (key >= index) break;
    offset += value;
  }
  return index + offset;
}
