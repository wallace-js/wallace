import type { FunctionExpression } from "@babel/types";

export type NodeAddress = Array<number>;

export interface ShieldInfo {
  key: string;
  reverse: boolean;
  skipCount: number;
}

export interface ComponentWatch {
  stashRef: string;
  shieldInfo?: ShieldInfo | undefined;
  callbacks: { [key: string]: FunctionExpression };
  address: NodeAddress;
}
