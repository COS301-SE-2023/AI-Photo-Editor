import { UniqueEntity } from "../../../shared/utils/UniqueEntity";
import type { SharedProject, LayoutPanel } from "../../../shared/types";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { PathLike } from "fs";
import type { GraphToJSON } from "../../lib/core-graph/CoreGraphExporter";
import { layoutTemplate } from "../../../frontend/lib/Project";
// Encapsulates the backend state for one of the open Blix projects
export class CoreProject extends UniqueEntity {
  private _name: string;
  // TODO: Appropriately handle when projects are closed/unloaded; we must remove the
  //       respective graphs from the GraphManager so they aren't left dangling.
  //       This also needs to be done in a way that checks that no other projects
  //       have references to the same graph.
  private _graphs: UUID[]; // Indexes into the GraphManager
  private _location: PathLike; // Location in user local storage to sync to
  private _saved: boolean; // Flag used to check if project has been saved since last changes
  private _layout: LayoutPanel;
  private _cache: UUID[];

  constructor(name: string) {
    super();
    this._name = name;
    this._graphs = [];
    this._location = "" as PathLike;
    this._saved = false;
    this._layout = layoutTemplate;
    this._cache = [];
  }

  public rename(name: string): boolean {
    if (name === "") {
      return false;
    } else {
      this._name = name;
      return true;
    }
  }

  /**
   * Adds a graph to a project
   *
   * @param id ID of graph to be added
   */
  public addGraph(id: UUID) {
    this._graphs.push(id);
  }

  /**
   * Removes a graph from a project
   *
   * @param id ID of graph to be removed
   */
  public removeGraph(id: UUID): boolean {
    const index = this._graphs.indexOf(id);
    if (index > -1) {
      this._graphs.splice(index, 1);
      return true;
    }
    return false;
  }

  public get name() {
    return this._name;
  }

  public get location() {
    return this._location;
  }

  public set location(value: PathLike) {
    this._location = value;
  }

  public get graphs() {
    return [...this._graphs];
  }

  public get layout() {
    return this._layout;
  }

  public set layout(value: LayoutPanel) {
    this._layout = value;
  }

  /**
   * Reduces the the state of the core project to be used by frontend. Might
   * need to figure out how this can be better implemented since it feels a bit
   * sus to have a frontend and backend data model which is very similar.
   *
   * @returns A reduced version of the CoreProject for the frontend
   */
  public toSharedProject(): SharedProject {
    const project = {
      name: this.name,
      id: this.uuid,
      saved: this._saved,
      graphs: [...this._graphs],
      cache: [...this._cache],
    };

    return project;
  }

  public get saved() {
    return this._saved;
  }

  public set saved(flag: boolean) {
    this._saved = flag;
  }

  public addCacheObjects(cacheUUIDs: UUID[]) {
    this._cache = [...this._cache, ...cacheUUIDs];
  }

  public removeCacheObjects(cacheUUIDs: UUID[]) {
    this._cache = this._cache.filter((id) => !cacheUUIDs.includes(id));
  }
}

export interface ProjectFile {
  layout: LayoutPanel;
  graphs: GraphToJSON[]; // TODO: Add graphs contained in project here
}
