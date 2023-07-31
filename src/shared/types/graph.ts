import type { NodeUI } from "../ui/NodeUITypes";
import type { GraphUUID } from "../ui/UIGraph";
import type { GraphNodeUUID } from "../ui/UIGraph";

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

export type IGraphUIInputs = { [key: GraphNodeUUID]: INodeUIInputs };
export interface INodeUIInputs {
  inputs: { [key: string]: UIValue };
  changes: string[];
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

export interface SharedGraph {
  uuid: GraphUUID;
  displayName: string;
}
