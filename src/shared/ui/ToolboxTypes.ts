import type { UUID } from "../utils/UniqueEntity";
import { NodeUI, type UIComponentConfig } from "./NodeUITypes";

export type NodeSignature = string;

// DELETE
// export class CommonProject {
//   constructor(readonly name: string, readonly uuid: UUID) {}
// }

// Interfaces for node
export class IAnchor {
  constructor(readonly type: string, readonly id: string, readonly displayName: string) {}
}

export class INode {
  constructor(
    readonly signature: NodeSignature,
    readonly title: string,
    readonly description: string,
    readonly icon: string,
    readonly inputs: IAnchor[],
    readonly outputs: IAnchor[],
    readonly ui: NodeUI | null,
    readonly uiConfigs: { [key: string]: UIComponentConfig }
  ) {}
}

// Inrerfaces for command
// export class ICommand {
//   constructor(
//     readonly signature: string,
//     readonly displayName: string,
//     readonly description: string,
//     readonly icon: string
//   ) {}
// }
