import { saveProjectCommand, type SaveProjectArgs, saveProjectAsCommand, openProjectCommand, openProject } from "../../../src/electron/lib/projects/ProjectCommands";
import { Command, type CommandContext, type CommandHandler } from "../../../src/electron/lib/registries/CommandRegistry";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { Blix } from "../../../src/electron/lib/Blix";
import { showOpenDialog, showSaveDialog } from "../../../src/electron/utils/dialog";
// import { showSaveDialog } from "../../../src/electron/utils/dialog";

// ====================================================
// MOCKING
// ====================================================
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

jest.mock("../../../src/electron/lib/plugins/PluginManager");
// jest.mock("../../../src/electron/lib/projects/ProjectManager");


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
        showSaveDialog: jest.fn(() => {
            return { filePath: "path" };
        }),
        showOpenDialog: jest.fn(() => {
            return { filePaths: ["path1", "path2"] };
        })
    }
}));

jest.mock("fs/promises", () => ({
    readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
    readFile: jest.fn((filePath, encoding) =>  { return "{ \"graphs\": [{ \"nodes\": [], \"edges\": []}], \"layout\": {} }" }),
    readdirSync: jest.fn(() => ["hello-plugin"]),
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    writeFileSync: jest.fn(),
  }));


describe("Testing project commands", () => {
    let blix: Blix;

    beforeEach(() => {
        jest.clearAllMocks();
        blix = new Blix();
        blix.init(mainWindow);
    });


    test("Create and run a saveProjectCommand", async () => {
        const command: Command = saveProjectCommand;
        // Basics
        expect(command.id).toEqual("blix.projects.save");
        expect(command.description?.description).toEqual("Save project to file system");
        expect(command.description?.name).toEqual("Save Project");

        const handler: CommandHandler = command.handler;
        const ctx: CommandContext = blix;

        // Valid Case
        const project = blix.projectManager.createProject();
        let args: SaveProjectArgs = { projectId: project.uuid };
        jest.spyOn(blix, "sendSuccessMessage");
        await handler(ctx, args);
        expect(blix.sendSuccessMessage).toHaveBeenCalledWith("Project saved successfully");

        // Invalid Case
        args = { projectId: "SOME_RANDOM_UUID" };
        jest.spyOn(blix, "sendErrorMessage");
        await handler(ctx, args);
        expect(blix.sendErrorMessage).toHaveBeenCalledWith("Project not found"); 
    });
    
    
    test("Create and run a saveProjectAsCommand", async () => {
        const command: Command = saveProjectAsCommand;
        // Basics
        expect(command.id).toEqual("blix.projects.saveAs");
        expect(command.description?.description).toEqual("Save project to file system");
        expect(command.description?.name).toEqual("Save Project As...");

        const handler: CommandHandler = command.handler;
        const ctx: CommandContext = blix;

        // Valid Case
        const project = blix.projectManager.createProject();
        let args: SaveProjectArgs = { projectId: project.uuid };
        jest.spyOn(blix, "sendSuccessMessage");
        await handler(ctx, args);
        expect(blix.sendSuccessMessage).toHaveBeenCalledWith("Project saved successfully");

        // Invalid Case
        args = { projectId: "SOME_RANDOM_UUID" };
        jest.spyOn(blix, "sendErrorMessage");
        await handler(ctx, args);
        expect(blix.sendErrorMessage).toHaveBeenCalledWith("Project not found");
    });

    test("Create and run a openProjectCommand", async () => {
        const command: Command = openProjectCommand;
        // Basics
        expect(command.id).toEqual("blix.projects.open");
        expect(command.description?.description).toEqual("Save project to file system");
        expect(command.description?.name).toEqual("Open project...");

        const handler = command.handler;
        const ctx: CommandContext = blix;
        await handler(ctx);
    })
})