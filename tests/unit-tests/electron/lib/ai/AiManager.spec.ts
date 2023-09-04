import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import { AiManager } from "../../../../../src/electron/lib/ai/AiManager";
import { Blix } from "../../../../../src/electron/lib/Blix";
const path = require('path');
const fs = require('fs');
const getSecret = require('../../../../../src/electron/utils/settings').getSecret;

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
    utilClientApi: {
        showToast : jest.fn(),
    }
    
  }
} as any;

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
}));

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
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn(),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

jest.mock("../../../../../src/electron/utils/settings", () => ({
    getSecret: jest.fn(() => {
        return "1234-1234-1234-1234";
        }
    )
}));

// jest.mock("path", () => ({
//     join: jest.fn(() => {
//         return "test/electron/plugins/hello-plugin/python";
//         }
//     )
//     base: jest.fn(() => {
// }));


jest.mock("path", () => ({
  join: jest.fn().mockImplementation((...paths) => {
    return paths.join("/");
  }),
  basename: jest.fn().mockImplementation(() => {
    return "hello-plugin";
  }),
}));

describe("Test AI Manager", () => {
    let aiManager : AiManager;
    let blix : Blix;


    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);
        aiManager = new AiManager(blix.toolbox,blix.graphManager,mainWindow);
    });

    test("Test constructor", () => {
        expect(aiManager).toBeDefined();
        expect(aiManager).toBeDefined();
    })

    test("Test pluginContext", () => {
        expect(aiManager.pluginContext).toBeDefined();

        const result = aiManager.pluginContext();
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
    })

    test("Test getModels", () => {
        expect(aiManager.getSupportedModels).toBeDefined();

        const result = aiManager.getSupportedModels();
        expect(result).toBeDefined();
        expect(result.OpenAI).toBe("OpenAI");
    })


    // Integration test
    test("Test retrieveKey", () => {
        const result = aiManager.retrieveKey("OpenAI");
        expect(result).toBeDefined();
        expect(result).toBe("1234-1234-1234-1234");
    })

    test("Test retrieveKey empty", () => {

        getSecret.mockReturnValue(undefined,true);

        const result = aiManager.retrieveKey("OpenAI");

        
        expect(result).toBe("");
    })

    test("Handle notification", () => {
        aiManager.handleNotification("test","success");
        expect(mainWindow.apis.utilClientApi.showToast).toBeCalled();
    })

    test("Test findPythonScriptPath", () => {
        const result = aiManager["findPythonScriptPath"]();
        expect(result).toBeDefined();
        expect(result).toBe("/python/main.py");
    })

    test("Test findPythonScriptPath", () => {


        fs.existsSync.mockReturnValue(false);


        const result = aiManager["findPythonScriptPath"]();
        expect(result).toBeDefined();
        expect(result).toBe("");
    });

    // test("Test handle api error response", () => {

    //     const result = aiManager["handleApiErrorResponse"]("test","OpenAI");
    //     expect(result).toBeDefined();
    //     expect(result).toBe("test");
    // });


  });