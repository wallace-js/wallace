import { countOffset } from "../offsetter";

/**
 * Repeats nested components, yielding from the pool sequentially.
 */
export function SequentialRepeater(
  componentDefinition,
  /* #INCLUDE-IF: allowRepeaterSiblings */ adjustmentTracker,
  /* #INCLUDE-IF: allowRepeaterSiblings */ initialIndex
) {
  this.d = componentDefinition;
  /* #INCLUDE-IF: allowDismount */ this.s = componentDefinition.pool;
  this.p = [];
  this.c = 0; // Child count
  /* #INCLUDE-IF: allowRepeaterSiblings */ this.a = adjustmentTracker;
  /* #INCLUDE-IF: allowRepeaterSiblings */ this.i = initialIndex;
}

/**
 * Updates the element's childNodes to match the items.
 * Performance is important.
 */
SequentialRepeater.prototype = {
  patch: function (parent, items, /* #INCLUDE-IF: allowCtrl */ ctrl) {
    const componentDefinition = this.d,
      /* #INCLUDE-IF: allowDismount */ sharedPool = this.s,
      previousChildCount = this.c,
      pool = this.p,
      itemsLength = items.length,
      childNodes = parent.childNodes;

    let i = 0,
      offset = 0,
      component,
      nextElement,
      initialIndex,
      offsetTracker,
      endOfRange = previousChildCount,
      poolCount = pool.length,
      originalPoolCount = poolCount;

    if (wallaceConfig.flags.allowRepeaterSiblings) {
      initialIndex = this.i;
      offsetTracker = this.a;
      if (offsetTracker) {
        // The repeat element has siblings
        offset = countOffset(offsetTracker, initialIndex);
        endOfRange += offset;
        nextElement = childNodes[endOfRange] || null;
      }
    }
    while (i < itemsLength) {
      if (i < poolCount) {
        component = pool[i];
      } else {
        if (wallaceConfig.flags.allowDismount) {
          component = sharedPool.pop() || new componentDefinition();
        } else {
          component = new componentDefinition();
        }
        pool.push(component);
        poolCount++;
      }
      component.render(items[i], /* #INCLUDE-IF: allowCtrl */ ctrl);
      if (i >= previousChildCount) {
        parent.insertBefore(component.el, nextElement);
      }
      i++;
    }
    this.c = itemsLength;

    let removeAtIndex = offset + previousChildCount - 1;
    const stopAtIndex = offset + itemsLength - 1;
    for (let i = removeAtIndex; i > stopAtIndex; i--) {
      parent.removeChild(childNodes[i]);
    }

    /* #INCLUDE-IF: allowRepeaterSiblings */
    if (offsetTracker) {
      offsetTracker.set(initialIndex, itemsLength - 1);
    }

    /* #INCLUDE-IF: allowDismount */
    while (originalPoolCount > itemsLength) {
      pool.pop().dismount();
      originalPoolCount--;
    }
  },
  /* #INCLUDE-IF: allowDismount */ dismount: function () {
    let pool = this.p,
      poolCount = pool.length;
    while (poolCount > 0) {
      pool.pop().dismount();
      poolCount--;
    }
    pool.length = 0;
  }
};
