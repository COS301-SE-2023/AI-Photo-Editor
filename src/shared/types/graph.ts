import type { NodeUI } from "@shared/ui/NodeUITypes";

export interface IAnchor {
  type: string;
  signature: string;
  displayName: string;
}

export interface INode {
  signature: string;
  title: string;
  description: string;
  icon: string;
  inputs: IAnchor[];
  outputs: IAnchor[];
  ui: NodeUI | null;
}

export type UIValue = unknown;

export interface INodeUIInputs {
  inputs: { [key: string]: UIValue };
}

export type QueryResponse<S = unknown, E = unknown> =
  | {
      status: "error";
      message: string;
      data?: E;
    }
  | {
      status: "success";
      message?: string;
      data?: S;
    };
