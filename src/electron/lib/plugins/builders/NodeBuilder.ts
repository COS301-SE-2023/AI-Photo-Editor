import { type PluginContextBuilder } from "./PluginContextBuilder";
import { NodeInstance, NodeUIParent } from "../../core-graph/ToolboxRegistry";

export class NodeBuilder implements PluginContextBuilder {
  constructor(node: NodeInstance) {
    this.node = node;
    this.ui = null;
  }

  private node: NodeInstance;
  public ui: NodeUIParent | null;

  public validate(): void {
    if (this.node.getSignature === "") {
      throw new Error("Node is not instantiated");
    }

    if (this.ui != null) {
      this.node.setUI(this.ui);
    }
    return;
  }

  get build(): any {
    return null;
  }

  public setTitle(title: string): void {
    this.node.setTitle(title);
  }
  public setDescription(description: string): void {
    this.node.setDescription(description);
  }

  public instantiate(plugin: string, name: string): void {
    if (plugin === "" || name === "") {
      throw new Error("Plugin or name is not instantiated");
    }

    this.node.instantiate(plugin, name);
  }

  public addIcon(icon: string): void {
    this.node.setIcon(icon);
  }

  public addInput(type: string, anchorname: string): void {
    this.node.addInput(type, anchorname);
  }

  public addOutput(type: string, anchorname: string): void {
    this.node.addOutput(type, anchorname);
  }

  public createUIBuilder(): NodeUIBuilder {
    const node = new NodeUIParent();
    const builder = new NodeUIBuilder(node);
    if (this.ui == null) this.ui = node; // set root node
    return builder;
  }

  public define(code: any) {
    this.node.setFunction(code);
  }
}

export class NodeUIBuilder {
  constructor(private node: NodeUIParent) {}

  public addButton(name: string, param: string): NodeUIBuilder {
    this.node.addButton(name, param);

    return this;
  }
}
