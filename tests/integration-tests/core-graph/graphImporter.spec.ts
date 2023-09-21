import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../src/electron/lib/registries/ToolboxRegistry";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { Blix } from "../../../src/electron/lib/Blix";
import { CoreGraphImporter } from "../../../src/electron/lib/core-graph/CoreGraphImporter";
import { CoreGraph } from "../../../src/electron/lib/core-graph/CoreGraph";
import { CoreGraphExporter, GraphToJSON } from "../../../src/electron/lib/core-graph/CoreGraphExporter";

jest.mock('@electron/remote', () => ({ exec: jest.fn() }));
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

jest.mock("../../../src/electron/lib/projects/ProjectManager");

jest.mock('../../../src/electron/lib/plugins/PluginManager')


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

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  readdirSync: jest.fn(() => ["hello-plugin"]),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));


describe("Test graph importer", () => {
    let blix: Blix;
    let importer: CoreGraphImporter;

    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);
        importer = new CoreGraphImporter(blix.toolbox);
        blix.toolbox.addInstance(new NodeInstance("testNode", "blix", "testNode", "This is a test node", "", [{ type: "Number", "displayName": "blix.testNode.0", "identifier": "In0" }], [{ type: "Number", "displayName": "blix.testNode.1", "identifier": "Out0" }]))
    });

    test("Test import of valid json graph", () => {
        // console.log(blix.toolbox);

        const graphToImport: GraphToJSON = {
          "nodes": [
            {
              "signature" : "blix.output",
              "position" : { x: 0, y: 0},
              "inputs" : {}
            },
            {
              "signature" : "blix.testNode",
              "position" : { x: 0, y: 0},
              "inputs" : {}
            }
          ],
          "edges": [{
            anchorFrom: {
                parent: 1,
                id: "Out0"
            },
            anchorTo: {
                parent: 0,
                id: "in"
            }
          }]
        };
        
        const coreGraph: CoreGraph = importer.import("json", graphToImport);
    });


    // Invalid Case
    test("Test invalid type", () => {
        const graph = importer.import("random", "");
        expect(graph).toBeInstanceOf(CoreGraph);
    });
});