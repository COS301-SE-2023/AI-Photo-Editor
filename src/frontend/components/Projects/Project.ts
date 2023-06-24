import type { UUID } from "@shared/utils/UniqueEntity";
import { PanelGroup } from "../../layout/PanelNode";
import Graph from "layout/tiles/Graph.svelte";
import Media from "layout/tiles/Media.svelte";

export class Project {
  private _name: string;
  private readonly _uuid: UUID;
  private _layout: PanelGroup;

  constructor(name: string, uuid: UUID) {
    this._name = name;
    this._uuid = uuid;
    this._layout = new PanelGroup("1");
    this._layout.addPanel(Graph, 1);
    this._layout.addPanel(Media, 0);
  }

  public get uuid() {
    return this._uuid;
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
