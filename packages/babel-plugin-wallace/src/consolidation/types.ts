import type { CallExpression } from "@babel/types";

export type NodeAddress = Array<number>;

export interface Detacher {
  originalIndex: number; // the index at which the node would be displayed.
  stashKey: number;
  parentKey: number;
}

export interface ShieldInfo {
  lookupIndex?: number;
  reverse?: boolean;
  skipCount?: number;
  detacher?: Detacher;
}

export interface Part {
  callExpression: CallExpression;
  address: NodeAddress;
  name: string;
}
