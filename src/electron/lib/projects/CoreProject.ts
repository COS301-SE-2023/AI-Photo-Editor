import { UniqueEntity } from "../../../shared/utils/UniqueEntity";
import { CoreGraph } from "../core-graph/Graph";
import type { CommonProject } from "../../../shared/types/index";

// Encapsulates the backend state for one of the open Blix projects
export class CoreProject extends UniqueEntity {
  private _name: string;
  private _graphs: CoreGraph[];

  constructor(name: string) {
    super();
    this._name = name;
    this._graphs = [];
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
