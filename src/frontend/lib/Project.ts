import type { UUID } from "@shared/utils/UniqueEntity";
import { PanelGroup } from "./PanelNode";
import type { LayoutPanel, SharedProject } from "@shared/types/index";

export class Project {
  private _name: string;
  private readonly _id: UUID;
  private _layout: PanelGroup;
  private _group = 1;
  private _graphs: UUID[];

  constructor(name: string, id: UUID, layout: LayoutPanel, graphs: UUID[] = []) {
    this._name = name;
    this._id = id;
    this._layout = this.constructLayout(layout);
    this._graphs = graphs;
  }

  public static createFromSharedProject(project: SharedProject) {
    return new Project(project.name, project.id, project.layout, project.graphs);
  }

  /**
   * This function takes in the loaded in project and constructs the layout from
   * JSON to svelte components
   *
   * @param layout JSON format of the layout to be constructed
   * @returns A root PanelGroup that contains the layout of the project
   */
  public constructLayout(layout: LayoutPanel): PanelGroup {
    const group = new PanelGroup((this._group++).toString());
    if (layout.panels) {
      for (const panel of layout.panels) {
        if (panel.panels) {
          group.addPanelGroup(this.constructLayout(panel), panel.panels.length);
        } else {
          if (panel.content) {
            group.addPanel(panel.content, layout.panels.length);
          }
        }
      }
      return group;
    }
    return group;
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

  public get graphs() {
    return [...this._graphs];
  }
}
