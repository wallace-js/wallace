import * as t from "@babel/types";
import { arrayStartsWith } from "../utils";
import { ComponentDefinitionData } from "./ComponentDefinitionData";

/**
 * Sets the skipCount of each watch's shieldInfo.
 * This indicates how many watches to skip if that element is hidden.
 * Must be done after processing watches as we need to know how many watches to skip.
 */
export function postProcessing(componentDefinition: ComponentDefinitionData) {
  const { watches, refs } = componentDefinition;
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
  console.log(watches.map(w => w.address));
  console.log(nestedCounts);
  refs.forEach(ref => {
    // need to find start and end, bearing in mind the ref may not have a watch.
    const covered = w =>
      ref.address == w.address || arrayStartsWith(ref.address, w.address);
    const start = watches.findIndex(covered) || 0;
    const end = watches.filter(covered).length + start;
    ref.callExpression.arguments.push(t.numericLiteral(start), t.numericLiteral(end));
    console.log(ref.name, ref.address, start, end);
    // const start = watches.findIndex(
    //   watch => watch.address == ref.address || arrayStartsWith(watch.address, ref.address)
    // );
    // const end = nestedCounts[start] + start;
    // console.log(ref.name, ref.address, start, end);
  });
}
