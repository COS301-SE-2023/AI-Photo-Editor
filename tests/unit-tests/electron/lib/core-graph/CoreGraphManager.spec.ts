
import { CommandRegistry,type CommandHandler, Command } from "../../../../../src/electron/lib/registries/CommandRegistry"
import { Blix } from "../../../../../src/electron/lib/Blix";
import { MainWindow } from "../../../../../src/electron/lib/api/apis/WindowApi";
import { ICommand } from "../../../../../src/shared/types/command";
import { UUID } from "../../../../../src/shared/utils/UniqueEntity";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import { CoreGraphManager } from "../../../../../src/electron/lib/core-graph/CoreGraphManager";
import { CoreGraphSubscriber, CoreGraphUpdateEvent, IPCGraphSubscriber ,CoreGraphUpdateParticipant} from "../../../../../src/electron/lib/core-graph/CoreGraphInteractors";
import { A } from "flowbite-svelte";
import { NodeInstance, type MinAnchor, InputAnchorInstance, OutputAnchorInstance, ToolboxRegistry } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
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
    },
    graphClientApi: {
        graphRemoved: jest.fn(),
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

jest.mock("electron-store", () => ({
    default: jest.fn().mockImplementation(() => {
      return {}
    })
}));


  describe("Test CoreGraphManager", () => {
   let graphs       : { [id: UUID]: CoreGraph };
   let subscribers  : { [key: UUID]: CoreGraphSubscriber<any>[] };
   let graphManager : CoreGraphManager;
   let blix : Blix
   let graph : CoreGraph;
    const inputs: MinAnchor[] = [];
    const outputs: MinAnchor[] = [];

    beforeEach(() => {
        blix = new Blix();
        blix.init(mainWindow);

        graphManager = new CoreGraphManager(blix.toolbox,mainWindow);
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
        graphManager.addNode(graph.uuid,node,CoreGraphUpdateParticipant.system);
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
        graphManager.addNode(graph.uuid,node,CoreGraphUpdateParticipant.system);
        graphManager.addNode(graph.uuid,node2,CoreGraphUpdateParticipant.system);


        let anchors : string[] = [];
        for(const key in graphManager.getGraph(graph.uuid).getAnchors){
            anchors.push(key);
        }

        const response: QueryResponse<{ edgeId: string }> = graphManager.addEdge(graph.uuid,anchors[0],anchors[1],CoreGraphUpdateParticipant.system);

        expect(response.status).toBe("success"); 
    })

    test("Test addSubscriber", () => {
        const subscriber = new IPCGraphSubscriber();
        graphManager.addGraph(graph);
        graphManager.addSubscriber(graph.uuid,subscriber);
        expect(graphManager.getSubscribers(graph.uuid)).toContain(subscriber);
    })

    test("Test removeNode", () => {
        const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
        graphManager.addGraph(graph);
        graphManager.addNode(graph.uuid,node,CoreGraphUpdateParticipant.system);

        let nodes : string[] = [];
        for(const key in graphManager.getGraph(graph.uuid).getNodes){
            nodes.push(key);
        }

        graphManager.removeNode(graph.uuid,nodes[0],CoreGraphUpdateParticipant.system);
        expect(Object.keys(graphManager.getGraph(graph.uuid).getNodes).length).toBe(0);
    })

    test("Test removeEdge", () => {
        //Add Edge to graph
        const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
        const node2 = new NodeInstance("Finn", "Human", "Human.Finn", "This is the Finn plugin :)", "1150", inputs, outputs);

        node.inputs.push(new InputAnchorInstance("number","aaaa","aaaa.number"));
        node2.outputs.push(new OutputAnchorInstance("number","bbbb","bbbb.number"));

        graphManager.addGraph(graph);
        graphManager.addNode(graph.uuid,node,CoreGraphUpdateParticipant.system);
        graphManager.addNode(graph.uuid,node2,CoreGraphUpdateParticipant.system);


        const node1Node = Object.values(graph.getNodes)[0];
        const node2Node = Object.values(graph.getNodes)[1];

        const anchorFrom: UUID = Object.keys(node2Node.getAnchors)[0]; 
        const anchorTo: UUID = Object.keys(node1Node.getAnchors)[0]; 


        let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom, anchorTo);
        expect(result.status).toBe("success");
        
        let result2: QueryResponse = graphManager.removeEdge(graph.uuid,anchorTo,CoreGraphUpdateParticipant.system);
        expect(result2.status).toBe("success");
        expect(Object.keys(graph.getEdgeSrc).length).toBe(0);
        expect(Object.keys(graph.getEdgeDest).length).toBe(0);
  });

  test("Test setPos", () => {

    const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
    graphManager.addGraph(graph);
    graphManager.addNode(graph.uuid,node,CoreGraphUpdateParticipant.system);

    let nodes : string[] = [];
    for(const key in graphManager.getGraph(graph.uuid).getNodes){
        nodes.push(key);
    }
  const response : QueryResponse  =  graphManager.setPos(graph.uuid,nodes[0],0,0,CoreGraphUpdateParticipant.system);
  expect(response.status).toBe("success");
  })

  test(" Test createGraph", () => {
    const response : string  =  graphManager.createGraph();
    expect(response).toBeDefined();
  })

  test("Test loadGraph", () => {
    graphManager.loadGraph(graph);
    expect(graphManager.getGraph(graph.uuid).uuid).toBe(graph.uuid);
  });

  test("Delete graphs", () => {
    const graph2 = new CoreGraph();
    graphManager.addGraph(graph2);
    graphManager.addGraph(graph);

    graphManager.deleteGraphs([graph.uuid,graph2.uuid]);
    expect(graphManager.getGraph(graph.uuid)).toBeUndefined();
    expect(graphManager.getAllGraphUUIDs()).toEqual([]);
  })

    test("Test removeSubscriber", () => {
        expect(graphManager.removeSubscriber()).toBeUndefined();
    })

    test("Test undefined values", () => {

        const GRAPH_UPDATED_EVENT = new Set([CoreGraphUpdateEvent.graphUpdated]);
        expect(graphManager.getGraph("")).toBeUndefined();

        const result = graphManager.addEdge("","","",CoreGraphUpdateParticipant.system);
        expect(result.status).toBe("error");

        const node = new NodeInstance("Jake", "Shark", "Shark.Jake", "This is the Jake plugin :)", "1149", inputs, outputs);
        const result2 = graphManager.addNode("",node,CoreGraphUpdateParticipant.system);
        expect(result2.status).toBe("error");

        const result3 = graphManager.removeNode("","",CoreGraphUpdateParticipant.system);
        expect(result3.status).toBe("error");

        const result4 = graphManager.removeEdge("","",CoreGraphUpdateParticipant.system);
        expect(result4.status).toBe("error");

        const result5 = graphManager.setPos("","",0,0,CoreGraphUpdateParticipant.system);
        expect(result5.status).toBe("error");

        graphManager.addGraph(graph);
        const result6 = graphManager.deleteGraphs([""]);
        expect(result6).toStrictEqual([false]);

        const subscriber = new IPCGraphSubscriber();
        subscriber.onGraphChanged = jest.fn();
        graphManager["_subscribers"].all = [subscriber];
        graphManager.addSubscriber(graph.uuid,subscriber);

        graphManager.onGraphUpdated(graph.uuid,GRAPH_UPDATED_EVENT,CoreGraphUpdateParticipant.system);
        expect(subscriber.onGraphChanged).toBeCalled()
    })
});