import type { Registry, RegistryInstance } from "./Registry";
import type { INode, IAnchor } from "../../../shared/types";
import { randomUUID } from "crypto";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  addInstance(instance: NodeInstance): void {
    this.registry[instance.getSignature] = instance;
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

        for (const anchor of nodeInstance.getInputAnchorInstances) {
          const anchorObject = {
            type: anchor.type,
            signature: anchor.signature,
            displayName: anchor.displayName,
          };
          inputAnchors.push(anchorObject);
        }

        for (const anchor of nodeInstance.getOutputAnchorInstances) {
          const anchorObject = {
            type: anchor.type,
            signature: anchor.signature,
            displayName: anchor.displayName,
          };
          outputAnchors.push(anchorObject);
        }

        const nodeObbject = {
          signature: nodeInstance.getSignature,
          title: nodeInstance.getTitle,
          description: nodeInstance.getDescription,
          icon: nodeInstance.getIcon,
          inputs: inputAnchors,
          outputs: outputAnchors,
          ui: nodeInstance.getUI,
        };
        commands.push(nodeObbject);
      }
    }

    return commands;
  }
}

// This should probably become virtual
export class NodeUI {
  constructor() {
    this.parent = null;
    this.label = "";
    this.params = [];
    this.type = "ui";
  }
  public parent: NodeUI | null;
  public label: string;
  public params: any[];
  public type: string;
}

export class NodeUIParent extends NodeUI {
  constructor(label: string, parent: NodeUIParent | null) {
    super();
    this.label = label;
    this.parent = parent;
    this.params = [];
    this.type = "parent";
  }

  label: string;
  params: NodeUI[];
}

export class NodeUILeaf extends NodeUI {
  constructor(category: string, label: string, param: any[], parent: NodeUIParent) {
    super();
    this.label = label;
    this.params = param;
    this.type = "leaf";
    this.parent = parent;
    this.category = category;
  }
  category: string;
}

export class NodeInstance implements RegistryInstance {
  private uuid: string;
  constructor(
    private signature: string,
    private name: string,
    private plugin: string,
    private title: string,
    private description: string,
    private icon: string,
    private readonly inputs: InputAnchorInstance[],
    private readonly outputs: OutputAnchorInstance[]
  ) {
    this.func = () => {
      return "";
    };
    this.ui = null;
    this.uuid = randomUUID();
  }
  private ui: NodeUIParent | null;

  private func: any;

  get id(): string {
    return this.uuid;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setDescription(description: string) {
    this.description = description;
  }

  setIcon(icon: string) {
    this.icon = icon;
  }

  get getPlugin(): string {
    return this.plugin;
  }

  get getName(): string {
    return this.name;
  }

  instantiate(plugin: string, name: string) {
    this.plugin = plugin;
    this.name = name;
    this.signature = plugin + "." + name;
  }

  addInput(type: string, anchorname: string) {
    const id = this.plugin + "." + this.name + "." + anchorname;

    const anchor = new InputAnchorInstance(type, id, anchorname);

    this.inputs.push(anchor);
  }

  addOutput(type: string, anchorname: string) {
    const id = this.plugin + "." + this.name + "." + anchorname;

    const anchor = new OutputAnchorInstance(type, id, anchorname);

    this.outputs.push(anchor);
  }

  get getFunction(): any {
    return this.func;
  }

  setFunction(func: any) {
    this.func = func;
  }

  setUI(ui: NodeUIParent) {
    this.ui = ui;
  }

  get getUI(): NodeUIParent | null {
    return this.ui;
  }

  get getTitle(): string {
    return this.title;
  }

  get getDescription(): string {
    return this.description;
  }

  get getIcon(): string {
    return this.icon;
  }

  get getInputAnchorInstances(): InputAnchorInstance[] {
    return this.inputs;
  }

  get getOutputAnchorInstances(): OutputAnchorInstance[] {
    return this.outputs;
  }

  get getSignature(): string {
    return this.signature;
  }
}

export type AnchorType = string; // This uses MIME types E.g. "int", "text/json"

interface AnchorInstance {
  readonly type: AnchorType;
  readonly signature: string;
  readonly displayName: string;
}

export class InputAnchorInstance implements AnchorInstance {
  constructor(
    readonly type: AnchorType,
    readonly signature: string,
    readonly displayName: string
  ) {}
}

export class OutputAnchorInstance implements AnchorInstance {
  constructor(
    readonly type: AnchorType,
    readonly signature: string,
    readonly displayName: string
  ) {}
}
