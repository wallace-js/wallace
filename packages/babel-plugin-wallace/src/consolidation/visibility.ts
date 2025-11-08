import { arrayStartsWith } from "../utils";
import { ComponentWatch, NodeAddress } from "./types";

/*
 * Given an array of addresses such as:
 *
 *   [
 *     [0],
 *     [0, 1],
 *     [0, 2],
 *     [1],
 *   ]
 *
 * It returns an array with the count of nested items, like so:
 *
 *  [2, 0, 0, 0]
 *
 * Which indicates how many watches to skip if that element is hidden.
 */
function calculateShieldCounts(addresses: Array<NodeAddress>): NodeAddress {
  const processedAddresses = [];
  addresses.forEach((path) => {
    processedAddresses.forEach((processed) => {
      if (arrayStartsWith(processed.path, path)) {
        processed.count++;
      }
    });
    processedAddresses.push({ path: path, count: 0 });
  });
  return processedAddresses.map((i) => i.count);
}

/**
 * Must be done after processing watches as we need to know how many watches to skip.
 */
export function processShields(watches: Array<ComponentWatch>) {
  const addresses = watches.map((watch) => watch.address.slice(1));
  const skipCounts = calculateShieldCounts(addresses);
  watches.forEach((watch, index) => {
    if (watch.shieldInfo) {
      watch.shieldInfo.skipCount = skipCounts[index];
    }
  });
}
