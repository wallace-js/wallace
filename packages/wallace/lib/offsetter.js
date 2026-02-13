export function countOffset(offsetTracker, index) {
  let offset = 0;
  for (let [key, value] of offsetTracker.entries()) {
    if (key >= index) break;
    offset += value;
  }
  return index + offset;
}
