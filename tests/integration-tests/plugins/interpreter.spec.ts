import { Blix } from "../../../src/electron/lib/Blix";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { CoreGraphInterpreter } from "../../../src/electron/lib/core-graph/CoreGraphInterpreter";
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
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("Test CommandRegistry", () => {
    let interpreter : CoreGraphInterpreter;
    let blix : Blix;


    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);
        interpreter = new CoreGraphInterpreter(blix.toolbox);
    });

    test("Test constructor", () => {
      expect(interpreter).toBeDefined();
    })

});