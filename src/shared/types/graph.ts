import type { NodeUI } from "../../electron/lib/registries/ToolboxRegistry";

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
