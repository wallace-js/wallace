/**
 * Deals with conditionally detaching elements with the if directive.
 */
export function Detacher(i, e, s) {
  this.i = i; // the initial element index.
  this.e = e; // the stash key of the map of detached nodes.
  this.s = s; // the parent element key.
}

Detacher.prototype.apply = function (element, shouldBeVisible, elements, stash) {
  let adjustedIndex;
  const index = this.i,
    parent = elements[this.e],
    detachedElements = stash[this.s],
    detachedElement = detachedElements[index];
  if (shouldBeVisible && detachedElement) {
    adjustedIndex =
      index -
      Object.keys(detachedElements).filter(function (k) {
        return k < index && detachedElements[k];
      }).length;
    parent.insertBefore(detachedElement, parent.childNodes[adjustedIndex]);
    detachedElements[index] = null;
  } else if (!shouldBeVisible && !detachedElement) {
    parent.removeChild(element);
    detachedElements[index] = element;
  }
};
