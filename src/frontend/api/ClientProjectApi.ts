import type { ElectronWindowApi } from "electron-affinity/window";
import { projectManager } from "@frontend/stores/ProjectStore";
import type { CommonProject } from "@shared/types";

export class ClientProjectApi implements ElectronWindowApi<ClientProjectApi> {
  // Add more methods to this class which can be called by the backend if any
  // updates need to be made to the frontend project stores. Currently there is
  // an interval which emits an event in the ProjectManager in the backend as an
  // example
  projectChanged(state: CommonProject): void {
    // console.log("Project Changed", state);
    projectManager.updateProject(state);
  }

  public loadProject(state: CommonProject): void {
    // console.log("Project Loaded", state);
    projectManager.loadProject(state);
  }
}
