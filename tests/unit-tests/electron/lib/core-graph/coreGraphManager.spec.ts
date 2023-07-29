
import { CommandRegistry,type CommandHandler, Command } from "../../../../../src/electron/lib/registries/CommandRegistry"
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import { ICommand } from "../../../../../src/shared/types/command";
import { UUID } from "../../../../../src/shared/utils/UniqueEntity";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import { CoreGraphManager } from "../../../../../src/electron/lib/core-graph/CoreGraphManager";
import { CoreGraphSubscriber, IPCGraphSubscriber } from "../../../../../src/electron/lib/core-graph/CoreGraphInteractors";
import { A } from "flowbite-svelte";
import { NodeInstance, type MinAnchor, InputAnchorInstance, OutputAnchorInstance } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { QueryResponse } from "../../../../../src/shared/types";

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


describe("Test CoreGraphManager", () => {
  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];

  let blix : Blix;

  describe("Test CommandRegistry", () => {
   let graphs       : { [id: UUID]: CoreGraph };
   let subscribers  : { [key: UUID]: CoreGraphSubscriber<any>[] };
   let graphManager : CoreGraphManager
   let graph : CoreGraph;

    beforeEach(() => {
        graphManager = new CoreGraphManager(mainWindow);
        graph = new CoreGraph();
    });

    test("Test constructor", () => {
      expect(graphManager).toBeDefined();
    })


    test("Test addGraph", () => {
      //Add graph to registr
      const id = graph.uuid

      graphManager.addGraph(graph);
      expect(graphManager.getGraph(id)).toBe(graph);
    });

    test("Test addNode", () => {
        //Add Node to graph
        const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
        graphManager.addGraph(graph);
        graphManager.addNode(graph.uuid,node);
        const nodes = graphManager.getGraph(graph.uuid).getNodes;
        expect(Object.keys(nodes).length).toBe(1);
    })

    test("Test addEdge", () => {
        //Add Edge to graph
        const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
        const node2 = new NodeInstance("Finn", "Human", "Human.Finn", "This is the Finn plugin :)", "1150", inputs, outputs);

        node.inputs.push(new InputAnchorInstance("number","aaaa","aaaa.number"));
        node2.outputs.push(new OutputAnchorInstance("number","bbbb","bbbb.number"));

        graphManager.addGraph(graph);
        graphManager.addNode(graph.uuid,node);
        graphManager.addNode(graph.uuid,node2);


        let anchors : string[] = [];
        for(const key in graphManager.getGraph(graph._uuid).getAnchors){
            anchors.push(key);
        }

        console.log(anchors)

        const response: QueryResponse<{ edgeId: string }> = graphManager.addEdge(graph.uuid,anchors[0],anchors[1]);
                console.log(response.message);    

        expect(response.status).toBe("success"); 
    })

    test("Test addSubscriber", () => {
        const subscriber = new IPCGraphSubscriber();
        graphManager.addGraph(graph);
        graphManager.addSubscriber(graph._uuid,subscriber);
        expect(graphManager.getSubscribers(graph.uuid)).toContain(subscriber);
    })

  });
});