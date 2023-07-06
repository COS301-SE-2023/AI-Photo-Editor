import type { UUID } from "../utils/UniqueEntity";
import { NodeUI } from "./NodeUITypes";

export type NodeSignature = string;

export class CommonProject {
  constructor(readonly name: string, readonly uuid: UUID) {}
}

// Interfaces for node
export class IAnchor {
  constructor(readonly type: string, readonly signature: string, readonly displayName: string) {}
}

export class INode {
  constructor(
    readonly signature: NodeSignature,
    readonly title: string,
    readonly description: string,
    readonly icon: string,
    readonly inputs: IAnchor[],
    readonly outputs: IAnchor[],
    readonly ui: NodeUI | null
  ) {}
}

//Inrerfaces for command
export class ICommand {
  constructor(
    readonly signature: string,
    readonly displayName: string,
    readonly description: string,
    readonly icon: string
  ) {}
}
