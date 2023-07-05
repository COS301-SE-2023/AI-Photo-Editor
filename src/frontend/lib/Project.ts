import type { UUID } from "@shared/utils/UniqueEntity";
import { PanelGroup } from "./PanelNode";

export class Project {
  private _name: string;
  private readonly _id: UUID;
  private _layout: PanelGroup;

  constructor(name: string, id: UUID) {
    this._name = name;
    this._id = id;
    this._layout = new PanelGroup("1");

    const group1 = new PanelGroup("2");

    group1.addPanel("media", 0);
    group1.addPanel("shortcutSettings", 1);

    this._layout.addPanelGroup(group1, 0);
    this._layout.addPanel("debug", 2);
    this._layout.addPanel("graph", 3);
  }

  public get id() {
    return this._id;
  }
  public set name(name: string) {
    this._name = name;
  }

  public get name() {
    return this._name;
  }

  public get layout() {
    return this._layout;
  }
}
