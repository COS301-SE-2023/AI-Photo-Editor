import type { UUID } from "crypto";
import { PanelGroup } from "../../layout/PanelNode";

export class Project {
  private _name: string;
  private readonly _uuid: UUID;
  private _layout: PanelGroup | null;

  constructor(name: string, uuid: UUID, layout?: PanelGroup) {
    this._name = name;
    this._uuid = uuid;
    this._layout = layout || null;
  }

  public get uuid() {
    return this._uuid;
  }

  public get name() {
    return this._name;
  }
}
