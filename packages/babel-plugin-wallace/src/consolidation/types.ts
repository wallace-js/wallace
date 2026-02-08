import type { CallExpression, FunctionExpression } from "@babel/types";

export type NodeAddress = Array<number>;

export interface Detacher {
  originalIndex: number; // the index at which the node would be displayed.
  stashKey: number;
  parentKey: number;
}

export interface ShieldInfo {
  key: number;
  reverse: boolean;
  skipCount: number;
  detacher?: Detacher;
}

export interface ComponentWatch {
  elementKey: number;
  shieldInfo?: ShieldInfo | undefined;
  callbacks: { [key: string | number]: FunctionExpression };
  address: NodeAddress; // needed for setting the skipCount.
}

export interface Part {
  callExpression: CallExpression;
  address: NodeAddress;
  name: string;
}
