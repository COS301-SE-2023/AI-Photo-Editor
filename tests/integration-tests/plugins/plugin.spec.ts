import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUIParent } from "../../../src/electron/lib/registries/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../src/electron/lib/plugins/builders/NodeBuilder"
// import { ProjectManager } from "../../../src/electron/lib/projects/ProjectManager";
import { Plugin } from "../../../src/electron/lib/plugins/Plugin";
import { Blix } from "../../../src/electron/lib/Blix";
import { MainWindow } from "../../../src/electron/lib/api/apis/WindowApi";

jest.mock('@electron/remote', () => ({ exec: jest.fn() }));
const mainWindow: MainWindow = {
  apis: {
    commandRegistryApi: jest.fn(),
    clientGraphApi: jest.fn(),
    clientProjectApi: jest.fn()
    
  }
} as any;

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
    })
  },
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("mocked_base64_string"),
  readFile: jest.fn((filePath, callback) => callback(null, "mocked_file_data")),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

describe("Test builder propagations", () => {

    let nodeBuilder : NodeBuilder;
    let nodeUIBuilder : NodeUIBuilder;
  
    const inputs: InputAnchorInstance[] = [];
    const outputs: OutputAnchorInstance[] = [];
    beforeEach(() => {
      jest.clearAllMocks();

      const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
      const nodeUI = new NodeUIParent("Jake.Shark", null);
  
      nodeBuilder = new NodeBuilder(node);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
    });

    test("Adding a slider should affect nodeUI's paramaters", () => {
        const nodeUI = new NodeUIParent("Jake.Shark", null);
        nodeUIBuilder = new NodeUIBuilder(nodeUI);
        nodeUIBuilder.addSlider("shrek",0,100,50,1);
  
        expect(nodeUI.params[0].label).toEqual("shrek");
        expect(nodeUI.params[0].parent).toEqual(nodeUI);
        expect(nodeUI.params[0].type).toEqual("leaf");
        expect(nodeUI.params[0].params).toEqual([0,100,50,1]);
      });
  
      test("addDropdown should affect nodeUi's children", () => {
        const nodeUI = new NodeUIParent("Jake.Shark", null);
        nodeUIBuilder = new NodeUIBuilder(nodeUI);
        nodeUIBuilder.addDropdown("shrek",nodeBuilder.createUIBuilder().addButton("Shrek",() => {return "Shrek";}));
  
        expect(nodeUI.params[0].label).toEqual("shrek");
        expect(nodeUI.params[0].parent).toEqual(nodeUI);
        expect(nodeUI.params[0].type).toEqual("parent");
        expect(nodeUI.params[0].params[0].label).toEqual("Shrek");
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
      blix = new Blix(mainWindow);
      plugin.requireSelf(blix);
    });

    test("Plugin should send nodes to toolbox registry", () => {
        plugin.requireSelf(blix);

        const tools =  Object.values(blix.toolbox.getRegistry());
        expect(tools.length).toEqual(2);
      });

    test("Plugin should send commands to command registry", () => {
        plugin.requireSelf(blix);

        const commands =  Object.values(blix.commandRegistry.getRegistry());
        expect(commands.length).toEqual(3);
    })

    test("Plugin should be able to run", () => {
      console.log = jest.fn();
      plugin.requireSelf(blix);

      const commands =  blix.commandRegistry.getRegistry()["hello-plugin.import"];
      commands.run();
      expect(console.log).toHaveBeenCalled();

    })

    test("Command registry should have correct contents", () => {
      plugin.requireSelf(blix);

      const commands =  blix.commandRegistry.getRegistry();
      expect(commands.hasOwnProperty("hello-plugin.import")).toBeTruthy();
      expect(commands.hasOwnProperty("hello-plugin.export")).toBeTruthy();
      expect(commands.hasOwnProperty("hello-plugin.addBrightnessNode")).toBeTruthy();

    })
});
