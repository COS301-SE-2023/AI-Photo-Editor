import type { Registry, RegistryInstance } from "./Registry";
import { randomUUID } from "crypto";
import { NodeUIParent } from "../../../shared/ui/NodeUITypes";
import { IAnchor, INode } from "../../../shared/ui/ToolboxTypes";
import type { MainWindow } from "../api/apis/WindowApi";

export class ToolboxRegistry implements Registry {
  private registry: { [key: string]: NodeInstance } = {};

  constructor(readonly mainWindow?: MainWindow) {}

  addInstance(instance: NodeInstance): void {
    this.registry[instance.getSignature] = instance;
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

        for (const anchor of nodeInstance.getInputAnchorInstances) {
          const anchorObject = new IAnchor(anchor.type, anchor.signature, anchor.displayName);

          inputAnchors.push(anchorObject);
        }

        for (const anchor of nodeInstance.getOutputAnchorInstances) {
          const anchorObject = new IAnchor(anchor.type, anchor.signature, anchor.displayName);
          outputAnchors.push(anchorObject);
        }

        const nodeObject = new INode(
          nodeInstance.getSignature,
          nodeInstance.getTitle,
          nodeInstance.getDescription,
          nodeInstance.getIcon,
          inputAnchors,
          outputAnchors,
          nodeInstance.getUI
        );
        commands.push(nodeObject);
      }
    }

    return commands;
  }
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
