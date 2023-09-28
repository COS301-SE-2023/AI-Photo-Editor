import {refreshPluginsCommand} from "../../../../../src/electron/lib/plugins/pluginCommands";
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import { boolean } from "zod";
import { CommandContext } from "../../../../../src/electron/lib/registries/CommandRegistry";

jest.mock('../../../../../src/electron/lib/registries/CommandRegistry', () => {
  const originalModule = jest.requireActual('../../../../../src/electron/lib/registries/CommandRegistry'); // Replace with the correct path
  return {
    ...originalModule,
    CommandContext: {
      ...originalModule.CommandContext,
      pluginManager: {
        loadBasePlugins: jest.fn(),
      },
    },
  };
});


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
          graphRemoved: jest.fn(),
          uiInputsChanged: jest.fn()
      },
      utilClientApi: {
          showToast: jest.fn((message) => {
              // console.log(message);
              }),
      }
      
    }
  } as any;

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
            return { filePath: "path.blix" };
        }),
        showOpenDialog: jest.fn(() => {
            return { filePaths: ["path1.blix", "path2.blix"] };
        })
    },
    ipcMain: {
      on: jest.fn()
    },
    session: {
        defaultSession: {
          clearCache: jest.fn()
        }
      }
}));


it("Test refreshPluginsCommand", async () => {

    const blix = new Blix();
    const ctx = {
      pluginManager: {
        loadBasePlugins: jest.fn(),
      } 
    } as unknown as CommandContext;
        

    const a = await refreshPluginsCommand.handler(ctx);
    expect(a.status).toBe("success");
  })