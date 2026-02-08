import { countAdjustments } from "./adjuster";
/**
 * Deals with conditionally detaching elements with the if directive.
 */
export function Detacher(i, e, s) {
  this.i = i; // the initial element index.
  this.e = e; // the parent element key.
  this.s = s; // the stash key of the map of detached nodes.
}

Detacher.prototype.apply = function (element, shouldBeVisible, elements, stash) {
  let adjustedIndex;
  const index = this.i,
    parent = elements[this.e],
    detachedElementCache = stash[this.s];
  let offset = detachedElementCache[index] || 0;
  console.log("fff", index, shouldBeVisible, element, detachedElementInfo);
  if (shouldBeVisible && offset === -1) {
    adjustedIndex = countAdjustments(detachedElementCache, index);
    console.log("inserting", adjustedIndex, element, parent.childNodes[adjustedIndex]);
    parent.insertBefore(element, parent.childNodes[adjustedIndex]);
    offset = 0;
  } else if (!shouldBeVisible && offset === 0) {
    console.log("detaching", element);
    parent.removeChild(element);
    offset = -1;
  }
  detachedElementCache[index] = offset;
  console.log(detachedElementCache);
};
