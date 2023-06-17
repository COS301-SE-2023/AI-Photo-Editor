import { UniqueEntity } from "../../utils/UniqueEntity";
import { Project as FrontendProject } from "../../../frontend/components/Projects/Project";
import { CoreGraph } from "../core-graph/Graph";

// Encapsulates the backend state for one of the open Blix projects
export class CoreProject extends UniqueEntity {
  private _name: string;
  private _graphs: CoreGraph[];

  constructor(name: string) {
    super();
    this._name = name;
    this._graphs = [];
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
  public mapToFrontendProject(): FrontendProject {
    const project = new FrontendProject(this.name, this.uuid);
    return project;
  }
}
