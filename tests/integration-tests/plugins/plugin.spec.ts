import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUIParent } from "../../../src/electron/lib/core-graph/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../src/electron/lib/plugins/builders/NodeBuilder"
import { Plugin } from "../../../src/electron/lib/plugins/Plugin";
import { Blix } from "../../../src/electron/lib/Blix";
import { MainWindow } from "../../../src/electron/lib/api/WindowApi";
import {BrowserWindow} from "electron";
import { join } from "path";


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
    let mainWindow : MainWindow;


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

      mainWindow = new BrowserWindow({
        width: 1300,
        height: 1000,
        webPreferences: {
          devTools: !true,
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
          preload: join(__dirname, "preload.js"),
        },
        // Set icon for Windows and Linux
        icon: "public/images/blix_64x64.png",
        titleBarStyle: "hidden",
        trafficLightPosition: { x: 10, y: 10 },
      }) as MainWindow;

      

    const plugDir : string = "/home/centurion/Desktop/Centurion/Coding/301/Capstone/AI-Photo-Editor/blix-plugins/base-plugin";
    const main : string = "/home/centurion/Desktop/Centurion/Coding/301/Capstone/AI-Photo-Editor/blix-plugins/base-plugin/src/main.js";


    beforeEach(() => {
      jest.clearAllMocks();
      plugin = new Plugin(pack,plugDir,main);
      blix = new Blix(mainWindow);
    });

    test("Plugin should send nodes to toolbox registry", () => {

        plugin.requireSelf(blix);

        const tools =  Object.values(blix.toolbox.getRegistry);
        expect(blix.toolbox.getRegistry.length).toEqual(2);
      });
  
      test("addDropdown should affect nodeUi's children", () => {

      });
});
