import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUIParent, NodeUILeaf,ToolboxRegistry } from "../../../../../src/electron/lib/core-graph/ToolboxRegistry";
import { CoreGraph, CoreGraphStore } from "../../../../../src/electron/lib/core-graph/Graph";
import { UUID } from "../../../../../src/shared/utils/UniqueEntity";

describe("Test Graph", () => {


 describe("Test getters and setters", () => {
  let graph : CoreGraph;

  const inputs: InputAnchorInstance[] = [];
  const outputs: OutputAnchorInstance[] = [];
  let nodes : NodeInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    graph = new CoreGraph();

    for(let i = 0; i < 10; i++){
      const node = new NodeInstance("Jake.Shark",i.toString(), "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
      nodes.push(node);
      graph.addNode(node);
     }
  });
  test("addNode should add correct node", () => {
   graph = new CoreGraph();

    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    graph.addNode(node);
    const obs = Object.values(graph.getNodes);
    expect(obs[0].getPlugin).toEqual(node.getPlugin);
  });

  test("getNodes should get all the nodes properly", () => {

    const obs = Object.values(graph.getNodes);

    for(let i = 0; i < 10; i++){
      expect(obs[i].getName).toEqual(nodes[i].getName);
    }
  });

  test("getAnchors should get all the anchors properly", () => {
    let names : string[] = [];

    graph = new CoreGraph();

    for(let i = 0; i < 10; i++){
      const inAnchor =  new InputAnchorInstance("string","Jake.Shark"+i.toString(),"in"+i.toString());
      const outAnchor =  new OutputAnchorInstance("string","Jake.Shark"+i.toString(),"out"+i.toString());

      const node = new NodeInstance("Jake.Shark",i.toString(), "Jake", "The Jake plugin", "This is the Jake plugin", "1149", [inAnchor], [outAnchor]);
      graph.addNode(node);
      names.push(inAnchor.displayName);
      names.push(outAnchor.displayName);
     }

    const obs = Object.values(graph.getAnchors);

    for(let i = 0; i < 10; i++){

      expect(names).toContain(obs[i].getDisplayName);
    }
  });


  test("Test getting EdgeSrc", () => {
    expect(graph.getEdgeSrc).toBeDefined();
  })

  test("Test getting DestSrc", () => {
    expect(graph.getEdgeDest).toBeDefined();
  })


});


describe("Test CoreGraphStore", () => {
  test("Test creation of graphstore", () => {
    const graphs: { [key: string]: CoreGraph } = {};
    const store: CoreGraphStore = new CoreGraphStore(graphs);
    expect(store).toBeDefined();
  })

  test("Test creation of graph", () =>{
    const graphs: { [key: string]: CoreGraph } = {};
    const store: CoreGraphStore = new CoreGraphStore(graphs);
    const g = store.createGraph();
    expect(graphs[g]).toBeDefined();
  });
});


describe("Test CoreGraph", () => {
  let graph : CoreGraph;

  let inputs: InputAnchorInstance[] = [];
  let outputs: OutputAnchorInstance[] = [];
  let nodes : NodeInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    graph = new CoreGraph();

    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    // for(let i = 0; i < 10; i++){
    //   const node = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${i}`, `${plugin}`, title, description, icon, inputs, outputs);
    //   nodes.push(node);
    //   graph.addNode(node);
    //  }
    inputs = [];
    outputs = [];

    inputs.push(
      new InputAnchorInstance("string", "signature", "input_anchor1"),
      new InputAnchorInstance("number", "signature", "input_anchor2"),
      new InputAnchorInstance("string", "signature", "input_anchor2")
    );
    outputs.push(
      new OutputAnchorInstance("string", "signature", "output_anchor1"),
      new OutputAnchorInstance("number", "signature", "output_anchor2")
    );

  });


  test("Test adding a node to the graph", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node);
    expect(Object.values(graph.getNodes)[0]).toBeDefined();
  });


  test("Test removing a node to the graph", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node);
    const id: UUID = Object.keys(graph.getNodes)[0];
    graph.removeNode(id);
    expect(Object.values(graph.getNodes)[0]).toBeUndefined();
  });

  test("Test adding an edge to the graph", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node1Instance);
    graph.addNode(node2Instance);

    
    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    // 0 - input
    // 1 - input
    // 2 - output
    // 3 - output

    // console.log(node1Node.getAnchors);
    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

    // Valid edge
    // 1 -> 2
    let result: boolean = graph.addEdge(anchorFrom, anchorTo);
    expect(result).toBe(true);
    expect(Object.keys(graph.getEdgeSrc)[0]).toBe(anchorFrom);
    expect(Object.values(graph.getEdgeSrc)[0][0]).toBe(anchorTo);
    
    const edge = Object.values(graph.getEdgeDest)[0];
    expect(edge).toBeDefined();
    expect(Object.keys(graph.getEdgeDest)[0]).toBe(anchorTo);
    expect(edge.getAnchorFrom).toBe(anchorFrom);
    expect(edge.getAnchorTo).toBe(anchorTo);

    // Valid edge
    // 2 -> 1
    result = graph.addEdge(anchorTo, anchorFrom);
    expect(result).toBe(true);

    // Invalid edge
    // 1 output -> 2 output
    const node1Out: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const node2Out: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    result = graph.addEdge(node1Out, node2Out);
    expect(result).toBe(false);

    // Invalid edge
    // 1 output number -> 2 input string
    const node1OutNumber: UUID = Object.keys(node1Node.getAnchors)[4]; // output - number
    const node2InString: UUID = Object.keys(node2Node.getAnchors)[0]; // input - string
    result = graph.addEdge(node1OutNumber, node2InString);
    expect(result).toBe(false);

  });

  test("Test removing an edge", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node1Instance);
    graph.addNode(node2Instance);

    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

    let result: boolean = graph.addEdge(anchorFrom, anchorTo);
    expect(result).toBe(true);

    result = graph.removeEdge(anchorTo);
    expect(result).toBe(true);
  })

  test("Test cycle detection", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node3Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node4Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);

    graph.addNode(node1Instance);
    graph.addNode(node2Instance);
    graph.addNode(node3Instance);
    graph.addNode(node4Instance);

    
    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];
    const node3Node = Object.values(graph.getNodes)[2];
    const node4Node = Object.values(graph.getNodes)[3];

    const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: boolean = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result).toBe(true);

    const anchorFrom2: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    const anchorTo3: UUID = Object.keys(node3Node.getAnchors)[0]; // input

    result = graph.addEdge(anchorFrom2, anchorTo3);
    expect(result).toBe(true);

    // Cycle 1 -> 2 -> 3 -> 1
    const anchorFrom3: UUID = Object.keys(node3Node.getAnchors)[3]; // output
    const anchorTo1: UUID = Object.keys(node1Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom3, anchorTo1);
    expect(result).toBe(false);

  });

  // test("Test duplicate edge detection", () => {
  //   const plugin: string = "BestPlugin";
  //   const bestNode: string = "BestNode";
  //   const title: string = "Best Node";
  //   const description: string = "This is the Best Node in the world";
  //   const icon:string = "fa-diagram-project";

  //   const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
  //   const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);

  //   graph.addNode(node1Instance);
  //   graph.addNode(node2Instance);

  //   const node1Node = Object.values(graph.getNodes)[0];
  //   const node2Node = Object.values(graph.getNodes)[1];

  //   const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[2]; // output
  //   const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
  //   let result: boolean = graph.addEdge(anchorFrom1, anchorTo2);
  //   expect(result).toBe(true);

  //   const anchor1 = Object.values(node1Node.getAnchors)[2]; // output

  //   expect(graph.checkForDuplicateEdges(anchor1, anchor1)).toBe(true);
    

  // });


  test("Test removing node", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node3Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${3}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node4Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${4}`, `${plugin}`, title, description, icon, inputs, outputs);

    graph.addNode(node1Instance);
    graph.addNode(node2Instance);
    graph.addNode(node3Instance);
    graph.addNode(node4Instance);

    
    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];
    const node3Node = Object.values(graph.getNodes)[2];
    const node4Node = Object.values(graph.getNodes)[3];

    // 1 -> 2
    const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: boolean = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result).toBe(true);

    // 2 -> 3
    const anchorFrom2: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    const anchorTo3: UUID = Object.keys(node3Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom2, anchorTo3);
    expect(result).toBe(true);

    // 2 -> 4
    const anchorTo4: UUID = Object.keys(node4Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom2, anchorTo4);
    expect(result).toBe(true);

    // 1 -> 4
    const anchorTo4In2: UUID = Object.keys(node4Node.getAnchors)[2]; // input
    result = graph.addEdge(anchorFrom1, anchorTo4In2);
    expect(result).toBe(true);

    
    // Delete node 2
    graph.removeNode(node2Node.uuid);
    

    // Check that node 2 is gone
    expect(graph.getNodes[node2Node.uuid]).toBe(undefined);
    expect(Object.values(graph.getEdgeSrc[anchorFrom1]).length).toBe(1);
   
    expect(Object.values(graph.getEdgeSrc[anchorFrom1])[0]).toBe(anchorTo4In2);

  });


  // Not yet implemented with nodes
  test("Test creating node styling", () => {

  })

  test("Test converting node to JSON", () => {
    const plugin: string = "BestPlugin";
    const name: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${name}`,`${name}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    graph.addNode(node1Instance);
    const node1Node = Object.values(graph.getNodes)[0];
    const result = node1Node.toJSONObject();

    expect(result).toEqual(
      {
        id: node1Node.uuid,
        signature: `${plugin}/${name}-1`,
        styling: null
      });
  });

  test("Test edge converting to JSON", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node1Instance);
    graph.addNode(node2Instance);

    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

    let result: boolean = graph.addEdge(anchorFrom, anchorTo);
    expect(result).toBe(true);

    let edges = graph.edgesToJSONObject();
    expect(edges).toEqual([
      {
        id: anchorTo,
        anchorFrom: {
          parent: node1Node.uuid,
          id: anchorFrom
        },
        anchorTo: {
          parent: node2Node.uuid,
          id: anchorTo
        }
      }])

  });

  test("Test graph converting to JSON", () => {
    const plugin: string = "BestPlugin";
    const name: string = "BestNode";
    const title: string = "Best Node";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    const node1Instance = new NodeInstance(`${plugin}.${name}`,`${name}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
    const node2Instance = new NodeInstance(`${plugin}.${name}`,`${name}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    
    graph.addNode(node1Instance);
    graph.addNode(node2Instance);

    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

    let result: boolean = graph.addEdge(anchorFrom, anchorTo);
    expect(result).toBe(true);

  

    let graphJSON = graph.toJSONObject();
    expect(graphJSON).toEqual(
      {
        nodes: graph.nodesToJSONObject(),
        edges: graph.edgesToJSONObject(),
      });

    expect(graphJSON).toEqual(
      {
        nodes: [
          {
            id: node1Node.uuid,
            signature: `${plugin}/${name}-1`,
            styling: null
          },
          {
            id: node2Node.uuid,
            signature: `${plugin}/${name}-2`,
            styling: null
          }
        ],
        edges: [
          {
            id: anchorTo,
            anchorFrom: {
              parent: node1Node.uuid,
              id: anchorFrom
            },
            anchorTo: {
              parent: node2Node.uuid,
              id: anchorTo
            }
          }
        ]
      });


  });


  // test("Test removing edge error", () => {
  //   const plugin: string = "BestPlugin";
  //   const bestNode: string = "BestNode";
  //   const title: string = "Best Node";
  //   const description: string = "This is the Best Node in the world";
  //   const icon:string = "fa-diagram-project";

  //   const node1Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${1}`, `${plugin}`, title, description, icon, inputs, outputs);
  //   const node2Instance = new NodeInstance(`${plugin}.${bestNode}`,`${bestNode}-${2}`, `${plugin}`, title, description, icon, inputs, outputs);
    
  //   graph.addNode(node1Instance);
  //   graph.addNode(node2Instance);

  //   const node1Node = Object.values(graph.getNodes)[0];
  //   const node2Node = Object.values(graph.getNodes)[1];

  //   const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[2]; // output
  //   const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

  //   let result: boolean = graph.addEdge(anchorFrom, anchorTo);
  //   expect(result).toBe(true);

  //   result = graph.removeEdge("some random string");
  //   expect(result).toBe(false);
  // })

  }); // CoreGraph describe

});
