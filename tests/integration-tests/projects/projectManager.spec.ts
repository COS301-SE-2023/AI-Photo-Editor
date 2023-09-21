import { Blix } from "../../../src/electron/lib/Blix";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { ProjectManager } from "../../../src/electron/lib/projects/ProjectManager";
// ====================================================
// MOCKING
// ====================================================
const mainWindow: MainWindow = {
    apis: {
      graphClientApi: jest.fn(),
      projectClientApi: {
        onProjectCreated: jest.fn(),
        onProjectRemoved: jest.fn(),
        onProjectChanged: jest.fn()
      },
      toolboxClientApi: {
        registryChanged: jest.fn(),
      },
      commandClientApi: {
        registryChanged: jest.fn(),
      }
      
    }
} as any;

jest.mock("../../../src/electron/lib/plugins/PluginManager");

jest.mock("chokidar", () => ({
    default: {
      watch: jest.fn(() => {
        return {
          on: jest.fn()
        }
      }),
    }
}));

jest.mock("electron", () => ({
    app: {
      getPath: jest.fn((path) => {
        return "test/electron";
      }),
      getName: jest.fn(() => {
        return "TestElectron";
      }),
      getVersion: jest.fn(() => {
        return "v1.1.1";
      }),
      getAppPath: jest.fn(() => {
        return "test/electron";
      })
    },
    dialog: {
      showMessageBox: jest.fn().mockImplementation(() => Promise.resolve(0))
    },
    ipcMain: {
      on: jest.fn()
    }
}));

jest.mock("fs/promises", () => ({
    readFile: jest.fn((path) => {
        return "{}";
    })
}));

jest.mock('ws', () => {
  return {
    WebSocketServer:  jest.fn().mockImplementation(() => {
      return {
        on: jest.fn()
      }
    }
    )
  }
});
jest.mock('../../../src/electron/lib/plugins/PluginManager')



// ===================================================
// TESTS
// ===================================================


describe("Test Integration of ProjectManager", () => {
    let blix: Blix;
    let manager: ProjectManager;

    beforeEach(() => {
        jest.clearAllMocks();
        blix = new Blix();
        blix.init(mainWindow);
        manager = new ProjectManager(mainWindow);
    });

    test("Creating a project", () => {
        // With name
        const name = "TestProject";
        const coreProject = manager.createProject(name);
        expect(coreProject).toBeDefined();
        expect(coreProject.name).toEqual(name);
        const openProjectIds = manager.getOpenProjects().map((project) => project.uuid);
        expect(openProjectIds).toContain(coreProject.uuid);
        // Without name
        const untitledProject = manager.createProject();
        expect(untitledProject).toBeDefined();
        expect(untitledProject.name).toEqual("Untitled-1");
        const openProjectIds2 = manager.getOpenProjects().map((project) => project.uuid);
        expect(openProjectIds2).toContain(untitledProject.uuid); 
    });

    test("Loading a project", () => {
        const file = "test";
        const path = "path/to/file/test.blix";
        const uuid = manager.loadProject(file, path);
        const openProjectIds = manager.getOpenProjects().map((project) => project.uuid);
        expect(openProjectIds).toContain(uuid);
        const coreProject = manager.getProject(uuid);
        expect(coreProject).toBeDefined();
        expect(coreProject?.location).toEqual(path);
        expect(coreProject?.name).toEqual(file); 
    });

    test("Removing a project", () => {
        // Add Project
        const name = "TestProject";
        const coreProject = manager.createProject(name);
        const uuid = coreProject.uuid;
        expect(coreProject).toBeDefined();
        let openProjectIds = manager.getOpenProjects().map((project) => project.uuid);
        expect(openProjectIds).toContain(uuid);
        // Remove Project
        manager.removeProject(blix, uuid, true);
        openProjectIds = manager.getOpenProjects().map((project) => project.uuid);
        expect(openProjectIds.length).toEqual(0);
        expect(openProjectIds).not.toContain(uuid);
    });

    test("Renaming a project", () => {
        const name1 = "name1";
        const name2 = "name2";
        // Valid Project UUID
        const coreProject = manager.createProject(name1);
        expect(coreProject.name).toEqual(name1)
        const result = manager.renameProject(coreProject.uuid, name2);
        expect(result).toBe(true);
        expect(manager.getProject(coreProject.uuid)?.name).toEqual(name2);
        // Invalid Project UUID
        const coreProject2 = manager.createProject(name1);
        expect(coreProject2.name).toEqual(name1)
        const result2 = manager.renameProject("SOMERANDOMUUID", name2);
        expect(result2).toBe(false);
        expect(manager.getProject(coreProject2.uuid)?.name).not.toEqual(name2);
    });

    test("Adding a graph to a project", () => {
        const project = manager.createProject("project");
        const uuid = project.uuid;
        const graphId1 = "SOME_GRAPH_UUID1";
        // Valid Project
        let result = manager.addGraph(uuid, graphId1);
        expect(result).toBe(true);
        expect(project.graphs).toContain(graphId1);
        // Invaild Project
        const graphId2 = "SOME_GRAPH_UUID2";
        result = manager.addGraph("SOME_PROJECT_UUID", graphId2);
        expect(result).toBe(false);
        expect(project.graphs).not.toContain(graphId2);
    });

    test("Removing a graph from a graph", () => {
        const project = manager.createProject();
        const graph = "SOME_GRAPH_ID";
        const result = manager.addGraph(project.uuid, graph);
        expect(manager.getProject(project.uuid)?.graphs).toContain(graph);
        manager.removeGraph(graph);
        expect(manager.getProject(project.uuid)?.graphs).not.toContain(graph); 
    });

    test("onProjectChanged Event", () => {
        expect(manager.onProjectChanged("SOME_RANDOM_UUID")).toBeUndefined();
    })

    test("onProjectCreated Event", () => {
        expect(manager.onProjectCreated("SOME_RANDOM_UUID")).toBeUndefined();
    })


})