import type { UUID } from "@shared/utils/UniqueEntity";
import { PanelGroup } from "./PanelNode";
import type { panel } from "@shared/types/index";

export class Project {
  private _name: string;
  private readonly _id: UUID;
  private _layout: PanelGroup;
  private _group: number = 1;

  constructor(name: string, id: UUID, layout: panel) {
    this._name = name;
    this._id = id;
    
    this._layout = this.constructLayout(layout);
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
  /**
   * This function takes in the loaded in project and constructs the layout from JSON to svelte components
   * 
   * @param layout JSON format of the layout to be constructed
   * @returns A root PanelGroup that contains the layout of the project 
   */
  constructLayout(layout: panel): PanelGroup {
    const group = new PanelGroup((this._group++).toString());
    if(layout.panels) {
      console.log("Group")
      for (const panel of layout.panels) {
        if(panel.panels) {
          console.log("Group")
          group.addPanelGroup(this.constructLayout(panel), panel.panels.length);
        } 
        else {
          console.log("Leaf")
          if(panel.content) {
            group.addPanel(panel.content, layout.panels.length);
          }
        }
      }
      return group;
    }
    return group;
  }

}
