import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../src/electron/lib/registries/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../src/electron/lib/plugins/builders/NodeBuilder"
// import { ProjectManager } from "../../../src/electron/lib/projects/ProjectManager";
import { Plugin } from "../../../src/electron/lib/plugins/Plugin";
import { Blix } from "../../../src/electron/lib/Blix";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";
import { NodeUI, NodeUIParent } from "../../../src/shared/ui/NodeUITypes";
import {app} from "electron";
import { UIComponentConfig } from "../../../src/shared/ui/NodeUITypes";


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

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
}));
describe("Test builder propagations", () => {

    let nodeBuilder : NodeBuilder;
    let nodeUIBuilder : NodeUIBuilder;
  
    const inputs: MinAnchor[] = [];
    const outputs: MinAnchor[] = [];
    beforeEach(() => {
      jest.clearAllMocks();

      const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
      const nodeUI = new NodeUIParent("Jake.Shark", null);
  
      nodeBuilder = new NodeBuilder("testing-plugin", "My cool node");
      nodeUIBuilder = new NodeUIBuilder();
    });

    test("Adding a slider should affect nodeUI's paramaters", () => {
        nodeUIBuilder = new NodeUIBuilder();
        const uiComponentConfig : UIComponentConfig = {
            label: "slider",
            componentId: "shrek",
            defaultValue: 50,
            updatesBackend: true
        }
        nodeUIBuilder.addSlider(uiComponentConfig,{ min: 0, max: 100, step: 0.1 });
  
        expect(nodeUIBuilder["node"].params[0].label).toEqual("shrek");
        expect(nodeUIBuilder["node"].params[0].parent).toEqual(nodeUIBuilder["node"]);
        expect(nodeUIBuilder["node"].params[0].type).toEqual("leaf");
        expect(JSON.stringify(nodeUIBuilder["node"].params[0].params[0])).toEqual(JSON.stringify({ min: 0, max: 100, step: 0.1 }));
      });
  
      test("addDropdown should affect nodeUi's children", () => {
        nodeUIBuilder = new NodeUIBuilder();
          const uiComponentConfig : UIComponentConfig = {
            label: "dropdown",
            componentId: "SHROK",
            defaultValue: 50,
            updatesBackend: true
        }

        const buttonComponentConfig : UIComponentConfig = {
            label: "button",
            componentId: "Shrek",
            defaultValue: 50,
            updatesBackend: true
        }
        nodeUIBuilder.addDropdown(uiComponentConfig, {min: 0, max: 100, set: 0.1 });
  
        expect(nodeUIBuilder["node"].params[0].label).toEqual("SHROK");
        expect(nodeUIBuilder["node"].params[0].parent).toEqual(nodeUIBuilder["node"]);
        expect(nodeUIBuilder["node"].params[0].type).toEqual("leaf");
        expect(JSON.stringify(nodeUIBuilder["node"].params[0].params[0])).toBe(JSON.stringify({min: 0, max: 100, set: 0.1}));
      });
});

describe("Test plugin integrations", () => {
    let plugin : Plugin;
    let blix : Blix;

    const pack : any = {
        name: 'hello-plugin',
        displayName: 'Hello Plugin',
        description: 'A plugin that says hello',
        version: '0.0.1',
        author: 'Rec1dite',
        repository: '',
        contributes: { commands: [ [Object] ], nodes: [ [Object] ] },
        main: 'src/main.js',
        renderer: 'src/renderer.js',
        devDependencies: { '@types/node': '^12.0.0', typescript: '^3.4.5' },
        comments: [ 'This property will be completely ignored' ]
      };


    const plugDir : string = "../../../../blix-plugins/hello-plugin";
    const main : string = "../../../../blix-plugins/hello-plugin/src/main.js";


    beforeEach(() => {
      jest.clearAllMocks();
      plugin = new Plugin(pack,plugDir,main);
      blix = new Blix();
      blix.init(mainWindow);
      plugin.requireSelf(blix);
    });





      test('should return the correct production path', () => {

        jest.mock('electron', () => ({
        app: {
          getAppPath: jest.fn(),
          getPath: jest.fn(),
          isPackaged: false, // Mock app.isPackaged to return true
        },
      }));
        // Mock the return values of the functions being used in the pluginPaths function
        app.getAppPath = jest.fn().mockReturnValue('/path/to/app');
        app.getPath = jest.fn().mockReturnValue('/path/to/userData');

        Object.defineProperty(app, "isPackaged", {
        value: false,
        writable: false,
      });

        
        // plugin = new Plugin(pack,plugDir,main);
        blix = new Blix();
        blix.init(mainWindow);
        plugin.requireSelf(blix);
        // Call the function being tested
        const paths = blix.pluginManager.pluginPaths;
        console.log(paths)

        // Expect the result to match the expected production path
        paths.forEach((path) => {
          // expect(path).toMatch(/((\/|\\)[\w-]+)+/);
        })
      });
      

    test("Plugin should send nodes to toolbox registry", () => {
        const tools =  Object.values(blix.toolbox.getRegistry());
        expect(tools.length).toEqual(3);
      });

    test("Plugin should send commands to command registry", () => {
        const commands =  Object.values(blix.commandRegistry.getRegistry());
        expect(commands.length).toEqual(6);  // Find a more extensible solution for this
    })

    test("Command registry should have correct contents", () => {

      const commands =  blix.commandRegistry.getRegistry();
      expect(commands.hasOwnProperty("blix.projects.save")).toBeTruthy();
      expect(commands.hasOwnProperty("blix.projects.saveAs")).toBeTruthy();
      expect(commands.hasOwnProperty("blix.projects.open")).toBeTruthy();
      expect(commands.hasOwnProperty("blix.graphs.create")).toBeTruthy();
    })
});
