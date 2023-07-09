import type { Registry, RegistryInstance } from "./Registry";
import { randomUUID } from "crypto";
import { NodeUIParent } from "../../../shared/ui/NodeUITypes";
import { IAnchor, INode } from "../../../shared/ui/ToolboxTypes";
import type { MainWindow } from "../api/apis/WindowApi";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  constructor(readonly mainWindow?: MainWindow) {}

  addInstance(instance: NodeInstance): void {
    this.registry[instance.signature] = instance;
    // console.log("REGISTERING NODE " + instance.getSignature);

    // Update frontend toolbox
    this.mainWindow?.apis.toolboxClientApi.registryChanged(this.getNodes());

    return;
  }

  getRegistry(): { [key: string]: NodeInstance } {
    return this.registry;
  }

  getNodes(): INode[] {
    const commands: INode[] = [];
    for (const command in this.registry) {
      if (this.registry.hasOwnProperty(command)) {
        const nodeInstance: NodeInstance = this.registry[command];
        // Get anchors
        const inputAnchors: IAnchor[] = [];
        const outputAnchors: IAnchor[] = [];

        for (const anchor of nodeInstance.inputs) {
          const anchorObject = new IAnchor(anchor.type, anchor.id, anchor.displayName);

          inputAnchors.push(anchorObject);
        }

        for (const anchor of nodeInstance.outputs) {
          const anchorObject = new IAnchor(anchor.type, anchor.id, anchor.displayName);
          outputAnchors.push(anchorObject);
        }

        const nodeObject = new INode(
          nodeInstance.signature,
          nodeInstance.displayName,
          nodeInstance.description,
          nodeInstance.icon,
          inputAnchors,
          outputAnchors,
          nodeInstance.ui
        );
        commands.push(nodeObject);
      }
    }

    return commands;
  }
}

export type MinAnchor = { type: string; identifier: string; displayName: string };
export type NodeFunc = (input: any) => any;

export class NodeInstance implements RegistryInstance {
  public readonly inputs: InputAnchorInstance[];
  public readonly outputs: OutputAnchorInstance[];

  constructor(
    public readonly name: string, // Unique identifier for the node within the plugin
    public readonly plugin: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly icon: string,
    inputs: MinAnchor[],
    outputs: MinAnchor[],
    public readonly func: NodeFunc = () => null,
    public readonly ui: NodeUIParent | null = null
  ) {
    this.inputs = [];
    this.outputs = [];
    for (const a of inputs) {
      this.inputs.push(new InputAnchorInstance(a.type, a.identifier, a.displayName));
    }
    for (const a of outputs) {
      this.outputs.push(new OutputAnchorInstance(a.type, a.identifier, a.displayName));
    }
  }

  get id(): string {
    return this.signature;
  }

  // Global unique identifier for the node (amongst all plugins)
  get signature(): string {
    return this.plugin + "." + this.name;
  }

  get getFunction(): any {
    return this.func;
  }
}

export type AnchorType = string; // This uses MIME types E.g. "int", "text/json"

interface AnchorInstance {
  readonly type: AnchorType;
  readonly id: string;
  readonly displayName: string;
}

export class InputAnchorInstance implements AnchorInstance {
  constructor(
    readonly type: AnchorType,
    // TODO: Check uniqueness when loading the plugin!
    readonly id: string, // The lowercase anchor identifier name; must be unique within the node!
    readonly displayName: string
  ) {}
}

export class OutputAnchorInstance implements AnchorInstance {
  constructor(readonly type: AnchorType, readonly id: string, readonly displayName: string) {}
}
