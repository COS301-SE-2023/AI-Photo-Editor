import type { ElectronWindowApi } from "electron-affinity/window";
import type { SharedProject } from "@shared/types";
import { projectsStore } from "../../stores/ProjectStore";
// import { UIProject } from "../../Project";
// import type { UUID } from "../../../../shared/utils/UniqueEntity";

export class ProjectClientApi implements ElectronWindowApi<ProjectClientApi> {
  public onProjectCreated(state: SharedProject): void {
    projectsStore.handleProjectCreated(state, true);
  }

  public onProjectChanged(state: SharedProject): void {
    projectsStore.handleProjectChanged(state);
  }

  public onProjectRemoved(projectId: string): void {
    projectsStore.handleProjectRemoved(projectId);
  }

  public async handleProjectSaving(projectId: string): Promise<void> {
    await projectsStore.handleProjectSaving(projectId);
  }

  // public loadProject(state: SharedProject): void {
  //   const project = new Project(state.name, state.id, state.layout);
  //   projectsStore.addProject(project);
  // }

  // public loadProjects(state: SharedProject[]): void {
  //   const projects: Project[] = [];
  //   for (const project of state) {
  //     projects.push(new Project(project.name, project.id, project.layout));
  //   }
  //   projectsStore.addProjects(projects);
  // }
}
