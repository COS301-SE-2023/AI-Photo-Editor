import { UniqueEntity } from "../../../shared/utils/UniqueEntity";
import { CoreGraph } from "../core-graph/CoreGraph";
import type { CommonProject } from "../../../shared/types/index";
import type { UUID } from "../../../shared/utils/UniqueEntity";
import type { PathLike } from "fs";

// Encapsulates the backend state for one of the open Blix projects
export class CoreProject extends UniqueEntity {
  private _name: string;
  // TODO: Appropriately handle when projects are closed/unloaded; we must remove the
  //       respective graphs from the GraphManager so they aren't left dangling.
  //       This also needs to be done in a way that checks that no other projects
  //       have references to the same graph.
  private _graphs: UUID[]; // Indexes into the GraphManager
  private _location: PathLike; // Location in user local storage to sync to
  constructor(name: string) {
    super();
    this._name = name;
    this._graphs = [];
    this._location = "" as PathLike;
  }

  public rename(name: string): boolean {
    if (name === "") {
      return false;
    } else {
      this._name = name;
      return true;
    }
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

  /**
   * Reduces the the state of the core project to be used by frontend. Might
   * need to figure out how this can be better implemented since it feels a bit
   * sus to have a frontend and backend data model which is very similar.
   *
   * @returns A reduced version of the CoreProject for the frontend
   */
  public mapToCommonProject(): CommonProject {
    const project = {
      name: this.name,
      uuid: this.uuid,
    } satisfies CommonProject;

    return project;
  }
}
