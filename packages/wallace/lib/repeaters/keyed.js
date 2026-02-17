import { countOffset } from "../offsetter";

/**
 * Repeats nested components, reusing items based on key.
 *
 * COMPILER_MODS:
 *   if allowRepeaterSiblings is false the last two parameters are removed.
 */
export function KeyedRepeater(componentDefinition, key, adjustmentTracker, initialIndex) {
  this.d = componentDefinition;
  this.s = componentDefinition.prototype._c;
  this.p = new Map();
  this.k = []; // array of keys as last set.
  if (typeof key === "function") {
    this.f = key;
  } else {
    this.n = key;
  }
  if (wallaceConfig.flags.allowRepeaterSiblings) {
    this.a = adjustmentTracker;
    this.i = initialIndex;
  }
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 *
 * @param {DOMElement} parent - The DOM element to patch.
 * @param {Array} items - Array of items which will be passed as props.
 * @param {Array} sharedPool - the shared pool on the component.
 * @param {any} ctrl - The parent item's controller.
 */
KeyedRepeater.prototype = {
  patch: function (parent, items, ctrl) {
    const componentDefinition = this.d,
      sharedPool = this.s,
      ownPool = this.p,
      keyName = this.n,
      keyFn = this.f,
      useKeyName = keyName !== undefined,
      childNodes = parent.childNodes,
      itemsLength = items.length,
      previousKeys = this.k,
      previousKeysLength = previousKeys.length,
      newKeys = [],
      previousKeysSet = new Set(previousKeys),
      frag = document.createDocumentFragment();

    let item,
      el,
      itemKey,
      component,
      initialIndex,
      offsetTracker,
      endAnchor = null,
      adjustment = 0,
      anchor = null,
      fragAnchor = null,
      untouched = true,
      append = false,
      offset = previousKeysLength - itemsLength,
      i = itemsLength - 1;

    if (wallaceConfig.flags.allowRepeaterSiblings) {
      offsetTracker = this.a;
      initialIndex = this.i;
      if (offsetTracker) {
        adjustment = countOffset(offsetTracker, initialIndex);
        endAnchor = childNodes[previousKeysLength + adjustment] || null;
        anchor = endAnchor;
        untouched = false;
      }
    }

    // Working backwards saves us having to track moves.
    while (i >= 0) {
      item = items[i];
      itemKey = useKeyName ? item[keyName] : keyFn(item);
      if (!(component = ownPool.get(itemKey))) {
        component = sharedPool.pop() || new componentDefinition();
        ownPool.set(itemKey, component);
      }
      component.render(item, ctrl);
      el = component.el;
      if (untouched && !previousKeysSet.has(itemKey)) {
        frag.insertBefore(el, fragAnchor);
        fragAnchor = el;
        append = true;
        offset++;
      } else {
        if (itemKey !== previousKeys[i + offset]) {
          parent.insertBefore(el, anchor);
          untouched = false;
        }
        anchor = el;
      }
      newKeys.push(itemKey);
      previousKeysSet.delete(itemKey);
      i--;
    }

    if (append) {
      parent.insertBefore(frag, endAnchor);
    }

    let toStrip = previousKeysSet.size;
    while (toStrip > 0) {
      parent.removeChild(childNodes[adjustment]);
      toStrip--;
    }

    this.k = newKeys.reverse();

    if (wallaceConfig.flags.allowRepeaterSiblings) {
      if (offsetTracker) {
        offsetTracker.set(initialIndex, itemsLength - 1);
      }
    }

    for (const keyToRemove of previousKeysSet) {
      ownPool.get(keyToRemove).dismount();
      ownPool.delete(keyToRemove);
    }
  },
  dismount: function () {
    for (const [key, value] of this.p.entries()) {
      value.dismount();
    }
    this.p.clear();
  }
};
