import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../src/electron/lib/registries/ToolboxRegistry";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { Blix } from "../../../src/electron/lib/Blix";
import { CoreGraph } from "../../../src/electron/lib/core-graph/CoreGraph";
import { coreGraphCommands } from "../../../src/electron/lib/core-graph/CoreGraphCommands";
import type { Command, CommandContext } from "../../../src/electron/lib/registries/CommandRegistry";

const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn(),
    toolboxClientApi: {
      registryChanged: jest.fn(),
    },
    commandClientApi: {
      registryChanged: jest.fn(),
    },
    projectClientApi: {
        onProjectCreated: jest.fn(),
        onProjectChanged: jest.fn()
    },
    graphClientApi: {
        graphChanged: jest.fn(),
        graphRemoved: jest.fn()
    },
    utilClientApi: {
        showToast: jest.fn()
    }
    
  }
} as any;


jest.mock("chokidar", () => ({
  default: {
    watch: jest.fn(() => {
      return {
        on: jest.fn()
      }
    }),
  }
}));

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
}));


// jest.mock("../../../src/electron/lib/projects/ProjectManager");

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
  ipcMain: {
    on: jest.fn()
  }
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

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));


describe("Test core Graph Commands", () => {
    let blix: Blix;

    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);
    })

    test("Should create a graph", async () => {
        const projectId: string = blix.projectManager.createProject().uuid;
        jest.spyOn(blix, "sendSuccessMessage")
        await coreGraphCommands[0].handler(blix, {projectId});
        expect(blix.sendSuccessMessage).toHaveBeenCalledWith("Graph created successfully");
    });

    test("Should give an error when trying to add graph", async () => {

        jest.spyOn(blix, "sendErrorMessage")
        await coreGraphCommands[0].handler(blix, {projectId: "wrongId"});
        expect(blix.sendErrorMessage).toHaveBeenCalledWith("Project not found");
    });

    test("Should remove graph", async () => {

        jest.spyOn(blix, "sendErrorMessage")
        const project = blix.projectManager.createProject();
        await coreGraphCommands[0].handler(blix, {projectId: project.uuid});
        const graph = project.graphs[0];
        await coreGraphCommands[1].handler(blix, {id: graph})

        expect(project.graphs.length).toBe(0);
    });


});