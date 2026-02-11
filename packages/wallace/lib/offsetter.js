export function countOffset(detachedElementCache, index) {
  // var i = 0,
  //   offset = 0;
  // // TODO: use Map and iterate instead.
  // while (i < index) {
  //   offset += detachedElementCache[i] || 0;
  //   i++;
  // }
  // return index + offset;

  let offset = 0;
  for (let [key, value] of detachedElementCache.entries()) {
    console.log("key", key, "value", value);
    if (key >= index) break;
    offset += value;
  }
  return index + offset;
}
