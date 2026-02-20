import { countOffset } from "./offsetter";
/**
 * Deals with conditionally detaching elements with the if directive.
 */
export function Detacher(i, e, s, d) {
  this.i = i; // the initial element index.
  this.e = e; // the parent element key.
  this.s = s; // the stash key of the map of detached nodes.
}

// Element is either an HTMLElement or a NestedRepeater
Detacher.prototype.apply = function (element, shouldBeVisible, elements, stash) {
  const index = this.i,
    offsetTracker = stash[this.s];
  let ownOffset = offsetTracker.get(index) || 0;
  // console.log(shouldBeVisible, ownOffset);
  if ((shouldBeVisible && ownOffset === -1) || (!shouldBeVisible && ownOffset === 0)) {
    // console.log("should change");
    const parent = elements[this.e],
      realElement = element instanceof HTMLElement ? element : element.get().el;
    if (shouldBeVisible) {
      // console.log("attaching", realElement);
      const adjustedIndex = countOffset(offsetTracker, index);
      parent.insertBefore(realElement, parent.childNodes[adjustedIndex]);
      ownOffset = 0;
    } else {
      // console.log("removing", realElement);
      parent.removeChild(realElement);
      ownOffset = -1;
    }
  }
  offsetTracker.set(index, ownOffset); //shouldBeVisible ? 0 : -1);
  // console.log(offsetTracker);
};
