import type { ElectronWindowApi } from "electron-affinity/window";
import type { CommonProject } from "@shared/types";
import { projectsStore } from "../../stores/ProjectStore";
import { Project } from "../../Project";

export class ProjectClientApi implements ElectronWindowApi<ProjectClientApi> {
  // Add more methods to this class which can be called by the backend if any
  // updates need to be made to the frontend project stores. Currently there is
  // an interval which emits an event in the ProjectManager in the backend as an
  // example
  projectChanged(state: CommonProject): void {
    // console.log("Project Changed", state);
    // projectsStore.updateProject(state);
  }

  public loadProject(state: CommonProject): void {
    const project = new Project(state.name, state.uuid);
    projectsStore.addProject(project);
  }

  public loadProjects(state: CommonProject[]): void {
    const projects: Project[] = [];
    for (const project of state) {
      projects.push(new Project(project.name, project.uuid));
    }
    projectsStore.addProjects(projects);
  }
}
