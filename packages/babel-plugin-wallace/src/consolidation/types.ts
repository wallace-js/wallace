import type { FunctionExpression } from "@babel/types";

export type NodeAddress = Array<number>;

export interface Detacher {
  index: number;
  stashKey: number;
  parentKey: string;
}

export interface ShieldInfo {
  key: string;
  reverse: boolean;
  skipCount: number;
  detacher?: Detacher;
}

export interface ComponentWatch {
  elementKey: string;
  shieldInfo?: ShieldInfo | undefined;
  callbacks: { [key: string]: FunctionExpression };
  address: NodeAddress;
}
