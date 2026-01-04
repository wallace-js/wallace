import * as t from "@babel/types";
import { arrayStartsWith } from "../utils";
import { ComponentDefinitionData } from "./ComponentDefinitionData";

/**
 * Sets the skipCount of each watch's shieldInfo.
 * This indicates how many watches to skip if that element is hidden.
 * Must be done after processing watches as we need to know how many watches to skip.
 */
export function postProcessing(componentDefinition: ComponentDefinitionData) {
  const { watches, parts } = componentDefinition;
  const nestedCounts = {};
  watches.forEach((watch, index) => {
    nestedCounts[index] = watches
      .slice(index)
      .filter(w => arrayStartsWith(watch.address, w.address)).length;
  });
  watches.forEach((watch, index) => {
    if (watch.shieldInfo) {
      watch.shieldInfo.skipCount = nestedCounts[index];
    }
  });
  parts.forEach(part => {
    // need to find start and end, bearing in mind the part may not have a watch.
    const covered = w =>
      part.address == w.address || arrayStartsWith(part.address, w.address);
    const start = watches.findIndex(covered) || 0;
    const end = watches.filter(covered).length + start;
    part.callExpression.arguments.push(
      t.numericLiteral(start || 0),
      t.numericLiteral(end || 0)
    );
  });
}
