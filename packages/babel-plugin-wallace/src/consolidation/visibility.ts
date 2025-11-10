import { arrayStartsWith } from "../utils";
import { ComponentWatch } from "./types";

/**
 * Sets the skipCount of each watch's shieldInfo.
 * This indicates how many watches to skip if that element is hidden.
 * Must be done after processing watches as we need to know how many watches to skip.
 */
function setSkipCounts(
  watch: ComponentWatch,
  index: number,
  watches: Array<ComponentWatch>,
) {
  watch.shieldInfo.skipCount = watches
    .slice(index)
    .filter((w) => arrayStartsWith(watch.address, w.address)).length;
}

export function processeVisibilityToggles(watches: Array<ComponentWatch>) {
  watches.forEach((watch, index) => {
    if (watch.shieldInfo) {
      setSkipCounts(watch, index, watches);
    }
  });
}
