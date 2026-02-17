import { countOffset } from "../offsetter";

/**
 * Repeats nested components, reusing items based on key.
 */
export function KeyedRepeater(
  componentDefinition,
  key,
  /* #INCLUDE-IF: allowRepeaterSiblings */ adjustmentTracker,
  /* #INCLUDE-IF: allowRepeaterSiblings */ initialIndex
) {
  this.d = componentDefinition;
  /* #INCLUDE-IF: allowDismount */ this.s = componentDefinition.prototype._c;
  this.p = new Map();
  this.k = []; // array of keys as last set.
  if (typeof key === "function") {
    this.f = key;
  } else {
    this.n = key;
  }
  /* #INCLUDE-IF: allowRepeaterSiblings */ this.a = adjustmentTracker;
  /* #INCLUDE-IF: allowRepeaterSiblings */ this.i = initialIndex;
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 */
KeyedRepeater.prototype = {
  patch: function (parent, items, /* #INCLUDE-IF: allowCtrl */ ctrl) {
    const componentDefinition = this.d,
      /* #INCLUDE-IF: allowDismount */ sharedPool = this.s,
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
        if (wallaceConfig.flags.allowDismount) {
          component = sharedPool.pop() || new componentDefinition();
        } else {
          component = new componentDefinition();
        }
        ownPool.set(itemKey, component);
      }
      component.render(item, /* #INCLUDE-IF: allowCtrl */ ctrl);
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

    /* #INCLUDE-IF: allowRepeaterSiblings */
    if (offsetTracker) {
      offsetTracker.set(initialIndex, itemsLength - 1);
    }

    /* #INCLUDE-IF: allowDismount */
    for (const keyToRemove of previousKeysSet) {
      ownPool.get(keyToRemove).dismount();
      ownPool.delete(keyToRemove);
    }
  },
  /* #INCLUDE-IF: allowDismount */ dismount: function () {
    const pool = this.p;
    for (const [key, value] of pool.entries()) {
      value.dismount();
    }
    pool.clear();
  }
};
