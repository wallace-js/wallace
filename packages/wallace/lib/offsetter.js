export const countOffset = (offsetTracker, index) => {
  let offset = 0;
  for (let [key, value] of offsetTracker.entries()) {
    if (key < index) offset += value;
  }
  return index + offset;
};
