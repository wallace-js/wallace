import { countOffset } from "./offsetter";
/**
 * Deals with conditionally detaching single elements or components.
 * A Detacher is assigned to a watch, not a component.
 */
export function Detacher(initialIndex, parentElementKey, offsetTrackerStashKey) {
  this.i = initialIndex;
  this.e = parentElementKey;
  this.s = offsetTrackerStashKey;
}

/*
This is very tricky bit of code.

It is affected by:
  - initialIndex as passed into Detacher constructor.
  - offsetTracker's initial value.

It takes either:
  - an element, which starts attached.
  - a nester, whose element isn't attached to begin with.

Which affects how the insertion position is calculated.

About the offsetTracker:

The offset tracker is a map which stores a number against the initialIndex of each
conditionally displayed element, nester or repeater.

That number serves two purposes:
 1. For elements & nesters it indicates whether the element needs inserted or removed,
    if any.
 2. For all cases, it is used to calculate the position at which new itsems should be
    inserted.

Where it gets tricky is that the initial DOM will include elements, but not nester or
repeater elements.

For elements an offset of 0 means it is attached (and is the default if not set) and -1
indicates it is detached, and tells elements after it that they need to adjust their
insertion index by that much.

For nesters it is also 0 or -1, but the default is -1, which is set in the constructor.

For repeaters the offset is the number of items last rendered -1, because 0 items means
no elements inserted. However the repeaters never go through this function, so we can
assume the value here is always 0 or -1.

*/
Detacher.prototype.apply = function (elementOrNester, shouldBeVisible, elements, stash) {
  const index = this.i,
    offsetTracker = stash[this.s];
  let ownOffset = offsetTracker.get(index) || 0;

  if ((shouldBeVisible && ownOffset < 0) || (!shouldBeVisible && ownOffset === 0)) {
    var parent = elements[this.e],
      element =
        elementOrNester instanceof HTMLElement
          ? elementOrNester
          : elementOrNester.get().el;
    if (shouldBeVisible) {
      var adjustedIndex = countOffset(offsetTracker, index);
      parent.insertBefore(element, parent.childNodes[adjustedIndex]);
      ownOffset = 0;
    } else {
      parent.removeChild(element);
      ownOffset = -1;
    }
    offsetTracker.set(index, ownOffset);
  }
};
