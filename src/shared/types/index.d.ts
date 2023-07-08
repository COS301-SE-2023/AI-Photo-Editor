import type { UUID } from "../utils/UniqueEntity";
import { NodeUI } from "../../electron/lib/registries/ToolboxRegistry";
import type { panel } from "./layout";

interface CommonProject {
  name: string;
  uuid: UUID;
  layout: panel;
}

// Interfaces for node
interface IAnchor {
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

//Inrerfaces for command
export interface ICommand {
  signature: string;
  displayName: string;
  description: string;
  icon: string;
}
