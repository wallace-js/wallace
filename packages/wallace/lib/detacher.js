import { countOffset } from "./offsetter";
/**
 * Deals with conditionally detaching elements with the if directive.
 */
export function Detacher(i, e, s) {
  this.i = i; // the initial element index.
  this.e = e; // the parent element key.
  this.s = s; // the stash key of the map of detached nodes.
}

Detacher.prototype.apply = function (element, shouldBeVisible, elements, stash) {
  const index = this.i,
    parent = elements[this.e],
    offsetTracker = stash[this.s];
  let ownOffset = offsetTracker.get(index) || 0;
  if (shouldBeVisible && ownOffset === -1) {
    const adjustedIndex = countOffset(offsetTracker, index);
    parent.insertBefore(element, parent.childNodes[adjustedIndex]);
    ownOffset = 0;
  } else if (!shouldBeVisible && ownOffset === 0) {
    parent.removeChild(element);
    ownOffset = -1;
  }
  offsetTracker.set(index, ownOffset);
};
