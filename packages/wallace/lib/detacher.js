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
    detachedElementCache = stash[this.s],
    detachedElementInfo = detachedElementCache[index] || { a: 0 },
    detachedNode = detachedElementInfo.e;
  console.log("fff", index, shouldBeVisible, element, detachedElementInfo);
  if (shouldBeVisible && detachedNode) {
    adjustedIndex = countAdjustments(detachedElementCache, index);
    console.log(
      "inserting",
      adjustedIndex,
      detachedNode,
      parent.childNodes[adjustedIndex]
    );
    parent.insertBefore(detachedNode, parent.childNodes[adjustedIndex]);
    detachedElementInfo.e = null;
    detachedElementInfo.a = 0;
  } else if (!shouldBeVisible && !detachedNode) {
    console.log("detaching", element);
    parent.removeChild(element);
    detachedElementInfo.e = element;
    detachedElementInfo.a = -1;
  }
  detachedElementCache[index] = detachedElementInfo;
  console.log(detachedElementCache);
};

Detacher.prototype.__________apply = function (
  element,
  shouldBeVisible,
  elements,
  stash
) {
  let adjustedIndex;
  const index = this.i,
    parent = elements[this.e],
    detachedElementCache = stash[this.s],
    detachedElementInfo = detachedElementCache[index] || { a: 0 },
    detachedNode = detachedElementInfo.e;
  console.log("fff", index, shouldBeVisible, element, detachedElementInfo);
  if (shouldBeVisible && detachedNode) {
    adjustedIndex = countAdjustments(detachedElementCache, index);
    console.log(
      "inserting",
      adjustedIndex,
      detachedNode,
      parent.childNodes[adjustedIndex]
    );
    parent.insertBefore(detachedNode, parent.childNodes[adjustedIndex - 1]);
    detachedElementInfo.e = null;
    detachedElementInfo.a = 0;
  } else if (!shouldBeVisible && !detachedNode) {
    console.log("detaching", element);
    parent.removeChild(element);
    detachedElementInfo.e = element;
    detachedElementInfo.a = -1;
  }
  detachedElementCache[index] = detachedElementInfo;
  console.log(detachedElementCache);
};
