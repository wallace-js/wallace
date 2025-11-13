import type { FunctionExpression } from "@babel/types";

export type NodeAddress = Array<number>;

export interface Detacher {
  index: number;
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
  address: NodeAddress;
}
