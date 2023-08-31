import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, MinAnchor } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { CoreGraph, CoreGraphStore, NodesAndEdgesGraph, NodeOutToNodeIn, ReducedAnchor, ReducedEdge, ReducedNode, NodeStyling } from "../../../../../src/electron/lib/core-graph/CoreGraph";
import { UUID } from "../../../../../src/shared/utils/UniqueEntity";
import type { QueryResponse } from "../../../../../src/shared/types";
describe("Test backend graph", () => {


 describe("Testing get and set methods", () => {
  let graph : CoreGraph;

  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];
  let nodes : NodeInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    graph = new CoreGraph();

    for(let i = 0; i < 10; i++){
      const node = new NodeInstance(`Node-${i}`, "Test-plugin", `Node-${i}`, `This is node ${i}`, `fa-duotone fa-bell`, inputs, outputs);
      nodes.push(node);
      graph.addNode(node, { x: 0, y: 0 });
     }
  });

  test("Retrieving all nodes from graph", () => {
    const baseGraphNodeSignatures = Object.values(graph.getNodes).map((node) => node.getSignature);
    const createdNodesSignatures = nodes.map((node) => node.signature);
    for(const node of baseGraphNodeSignatures) {
      expect(createdNodesSignatures).toContain(node);
    }
  });

  test("Retrieving all anchors from graph", () => {
    let names : string[] = [];
    graph = new CoreGraph();
    for(let i = 0; i < 10; i++){
      const input: MinAnchor = { type: "string", displayName: `Test-plugin.Node-${i}.0`, identifier: `in${i}` };
      const output: MinAnchor = { type: "string", displayName: `Test-plugin.Node-${i}.1`, identifier: `out${i}` };
      const node = new NodeInstance(`Node-${i}`, `Test-plugin`, `Node-${i}`, `This is node ${i}`, `fa-duotone fa-bell`, [input], [output]);
      graph.addNode(node, { x: 0, y: 0 });
      names.push(input.displayName, output.displayName);
     }
    const anchorNames = Object.values(graph.getAnchors).map((anchor) => anchor.displayName);
    for(const name of names) {
      expect(anchorNames).toContain(name);
    }
  });

  test("Retrieving output nodes", () => {
    const nodes = graph.getOutputNodes;
    expect(nodes).toBeDefined();
  })


  test("Retrieving EdgeSrc", () => {
    expect(graph.getEdgeSrc).toBeDefined();
  })

  test("Retrieving DestSrc", () => {
    expect(graph.getEdgeDest).toBeDefined();
  })

  test("Setting a node's position", () => {
    const node = new NodeInstance("Test-plugin",`Node-1`, `Node-1`, `This is node 1`, `fa-duotone fa-bell`, inputs, outputs);
    const response: QueryResponse<{ nodeId: UUID }> = graph.addNode(node, { x: 0, y: 0});
    const uuid = (response.data! as { nodeId: UUID }).nodeId;
    const response2: QueryResponse = graph.setNodePos(uuid, { x: 6, y: 9});
    expect(response2.status).toBe("success");
  })


});


describe("Testing CoreGraphStore", () => {
  test("Creating a CoreGraphStore", () => {
    const graphs: { [id: UUID]: CoreGraph } = {};
    const store: CoreGraphStore = new CoreGraphStore(graphs);
    expect(store).toBeDefined();
  })

  test("Storing a graph in a CoreGraphStore", () =>{
    const graphs: { [id: UUID]: CoreGraph } = {};
    const store: CoreGraphStore = new CoreGraphStore(graphs);
    const graphId = store.createGraph();
    expect(graphs[graphId]).toBeDefined();
    expect(graphs[graphId].uuid).toBe(graphId);
  });

  test("Removing a graph from a CoreGrapStore", () => {
    const graphs: { [id: UUID]: CoreGraph } = {};
    const store: CoreGraphStore = new CoreGraphStore(graphs);
    const graphId = store.createGraph();
    // No current Implementation to remove
    expect(true).toBe(true);
  })
});


describe("Test CoreGraph Class", () => {
  let graph : CoreGraph;

  let inputs: MinAnchor[] = [];
  let outputs: MinAnchor[] = [];
  let nodes : NodeInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    graph = new CoreGraph();
  });

test("Adding a node to a graph", () => {
    const node = new NodeInstance("Node-1",`Test-Plugin`, `Node-1`, `This is node 1`, `fa-duotone fa-bell`, inputs, outputs);
    const response: QueryResponse<{ nodeId: UUID }> = graph.addNode(node, { x: 0, y: 0 });
    const uuid = (response.data! as { nodeId: UUID }).nodeId;
    expect(uuid).toBe(graph.getNodes[uuid].uuid);
    const node2 = graph.getNodes[uuid];
    expect(node2.getName).toBe("Node-1");
    expect(node2.getPlugin).toBe("Test-Plugin");
});



  test("Removing a node from a graph", () => {
    const node = new NodeInstance("Test-plugin",`Node-1`, `Node-1`, `This is node 1`, `fa-duotone fa-bell`, inputs, outputs);
    const response: QueryResponse<{ nodeId: UUID }> = graph.addNode(node, { x: 0, y: 0 });
    const uuid = (response.data! as { nodeId: UUID }).nodeId;
    graph.removeNode(uuid);
    expect(graph.getNodes[uuid]).toBeUndefined();
  });

  test("Adding an edge to a graph", () => {
    const plugin: string = "BestPlugin";
    const bestNode: string = "BestNode";
    const description: string = "This is the Best Node in the world";
    const icon:string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 

    const node1Instance = new NodeInstance(`${bestNode}-${1}`, `${plugin}`, `${bestNode}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${bestNode}-${2}`, `${plugin}`, `${bestNode}-2`, description, icon, inputs2, outputs2);
   
    const pos = { x: 0, y: 0 };
    graph.addNode(node1Instance, pos);
    graph.addNode(node2Instance, pos);

    
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
    let result: QueryResponse<{ edgeId: string}> = graph.addEdge(anchorFrom, anchorTo);
    expect(result.status).toBe("success");
    expect(Object.keys(graph.getEdgeSrc)[0]).toBe(anchorFrom);
    expect(Object.values(graph.getEdgeSrc)[0][0]).toBe(anchorTo);
    
    const edge = Object.values(graph.getEdgeDest)[0];
    expect(edge).toBeDefined();
    expect(Object.keys(graph.getEdgeDest)[0]).toBe(anchorTo);
    expect(edge.getAnchorFrom).toBe(anchorFrom);
    expect(edge.getAnchorTo).toBe(anchorTo);

    // Invalid edge, 1 -> 2 already exists
    // 2 -> 1
    result = graph.addEdge(anchorTo, anchorFrom);
    expect(result.status).toBe("error");

    // Invalid edge
    // 1 output -> 2 output
    const node1Out: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const node2Out: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    result = graph.addEdge(node1Out, node2Out);
    expect(result.status).toBe("error");

    // Invalid edge
    // 1 output number -> 2 input string
    const node1OutNumber: UUID = Object.keys(node1Node.getAnchors)[4]; // output - number
    const node2InString: UUID = Object.keys(node2Node.getAnchors)[0]; // input - string
    result = graph.addEdge(node1OutNumber, node2InString);
    expect(result.status).toBe("error");

    // Invalid Edge
    // unknown anchor -> unknown anchor
    result = graph.addEdge("","");
    expect(result.status).toBe("error");
    
    // Invalid Edge
    // unknown anchor -> known anchor
    result = graph.addEdge("", Object.keys(node1Node.getAnchors)[3]);
    expect(result.status).toBe("error");

    // Invalid Edge
    // unknown anchor -> known anchor
    result = graph.addEdge(Object.keys(node1Node.getAnchors)[3], "");
    expect(result.status).toBe("error");
  });

  test("Removing an edge from a graph", () => {

    const plugin: string = "Test-Plugin";
    const node: string = "Node";
    const description: string = "This is a node";
    const icon: string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 
  
    const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    
    const pos = { x: 0, y: 0 };
    graph.addNode(node1Instance, pos);
    graph.addNode(node2Instance, pos);

    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

    let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom, anchorTo);
    expect(result.status).toBe("success");

    let result2: QueryResponse = graph.removeEdge(anchorTo);
    expect(result2.status).toBe("success");
  })

  test("Checking for cycles", () => {
    const plugin: string = "Test-Plugin";
    const node: string = "Node";
    const description: string = "This is a node";
    const icon: string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let inputs3: MinAnchor[] = [];
    let inputs4: MinAnchor[] = []; 
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];
    let outputs3: MinAnchor[] = [];
    let outputs4: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` });
    
    inputs3.push(
    { type: "string", displayName: `Test-plugin.Node-3.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-3.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-3.2`, identifier: `in3` });

    outputs3.push(
    { type: "string", displayName: `Test-plugin.Node-3.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-3.4`, identifier: `out2` }); 

    inputs4.push(
    { type: "string", displayName: `Test-plugin.Node-4.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-4.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-4.2`, identifier: `in3` });
  
    outputs4.push(
    { type: "string", displayName: `Test-plugin.Node-4.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-4.4`, identifier: `out2` }); 
  
    const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    const node3Instance = new NodeInstance(`${node}-${3}`, `${plugin}`, `${node}-3`, description, icon, inputs3, outputs3);
    const node4Instance = new NodeInstance(`${node}-${4}`, `${plugin}`, `${node}-4`, description, icon, inputs4, outputs4);

    const pos = { x: 0, y: 0 };
    graph.addNode(node1Instance, pos);
    graph.addNode(node2Instance, pos);
    graph.addNode(node3Instance, pos);
    graph.addNode(node4Instance, pos);
    
    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];
    const node3Node = Object.values(graph.getNodes)[2];
    const node4Node = Object.values(graph.getNodes)[3];

    const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result.status).toBe("success");

    const anchorFrom2: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    const anchorTo3: UUID = Object.keys(node3Node.getAnchors)[0]; // input

    result = graph.addEdge(anchorFrom2, anchorTo3);
    expect(result.status).toBe("success");

    // Cycle 1 -> 2 -> 3 -> 1
    const anchorFrom3: UUID = Object.keys(node3Node.getAnchors)[3]; // output
    const anchorTo1: UUID = Object.keys(node1Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom3, anchorTo1);
    expect(result.status).toBe("error");
    
    // Can add more tests
  });

  test("Check for a duplicate edge", () => {
    const plugin: string = "Test-Plugin";
    const node: string = "Node";
    const description: string = "This is a node";
    const icon: string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 
  
    const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    
    const pos = { x: 0, y: 0 };
    graph.addNode(node1Instance, pos);
    graph.addNode(node2Instance, pos);

    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];

    const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result.status).toBe("success");

    let result2: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result2.status).toBe("error");

  });


  test("Removing a node from a graph", () => {
    const plugin: string = "Test-Plugin";
    const node: string = "Node";
    const description: string = "This is a node";
    const icon: string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let inputs3: MinAnchor[] = [];
    let inputs4: MinAnchor[] = []; 
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];
    let outputs3: MinAnchor[] = [];
    let outputs4: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` });
    
    inputs3.push(
    { type: "string", displayName: `Test-plugin.Node-3.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-3.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-3.2`, identifier: `in3` });

    outputs3.push(
    { type: "string", displayName: `Test-plugin.Node-3.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-3.4`, identifier: `out2` }); 

    inputs4.push(
    { type: "string", displayName: `Test-plugin.Node-4.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-4.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-4.2`, identifier: `in3` });
  
    outputs4.push(
    { type: "string", displayName: `Test-plugin.Node-4.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-4.4`, identifier: `out2` }); 
  
    const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    const node3Instance = new NodeInstance(`${node}-${3}`, `${plugin}`, `${node}-3`, description, icon, inputs3, outputs3);
    const node4Instance = new NodeInstance(`${node}-${4}`, `${plugin}`, `${node}-4`, description, icon, inputs4, outputs4);

    const pos = { x: 0, y: 0 };
    graph.addNode(node1Instance, pos);
    graph.addNode(node2Instance, pos);
    graph.addNode(node3Instance, pos);
    graph.addNode(node4Instance, pos);;

    
    const node1Node = Object.values(graph.getNodes)[0];
    const node2Node = Object.values(graph.getNodes)[1];
    const node3Node = Object.values(graph.getNodes)[2];
    const node4Node = Object.values(graph.getNodes)[3];

    // 1 -> 2
    const anchorFrom1: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo2: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom1, anchorTo2);
    expect(result.status).toBe("success");

    // 2 -> 3
    const anchorFrom2: UUID = Object.keys(node2Node.getAnchors)[3]; // output
    const anchorTo3: UUID = Object.keys(node3Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom2, anchorTo3);
    expect(result.status).toBe("success");

    // 2 -> 4
    const anchorTo4: UUID = Object.keys(node4Node.getAnchors)[0]; // input
    result = graph.addEdge(anchorFrom2, anchorTo4);
    expect(result.status).toBe("success");

    // 1 -> 4
    const anchorTo4In2: UUID = Object.keys(node4Node.getAnchors)[2]; // input
    result = graph.addEdge(anchorFrom1, anchorTo4In2);
    expect(result.status).toBe("success");

    
    // Delete node 2
    graph.removeNode(node2Node.uuid);
    

    // Check that node 2 is gone
    expect(graph.getNodes[node2Node.uuid]).toBe(undefined);
    expect(Object.values(graph.getEdgeSrc[anchorFrom1]).length).toBe(1);
   
    expect(Object.values(graph.getEdgeSrc[anchorFrom1])[0]).toBe(anchorTo4In2);

  });


  // Not yet implemented with nodes
  // test("Creating node styling", () => {

  // })

  // test("Converting a node to JSON format", () => {
  //   const plugin: string = "Test-Plugin";
  //   const name: string = "Node";
  //   const description: string = "This is the Best Node in the world";
  //   const icon:string = "fa-diagram-project";

  //   const node1Instance = new NodeInstance(`${name}-1`,`${plugin}`, `${name}`, description, icon, inputs, outputs);
  //   const response = graph.addNode(node1Instance);
  //   const uuid = (response.data! as { nodeId: UUID }).nodeId;
  //   const node = graph.getNodes[uuid];
  //   const json = node.exportJSON();

  //   expect(json).toStrictEqual(
  //     {
  //       signature: `${plugin}.${name}-1`,
  //       styling: undefined
  //     });
  // });
  // test("Test edge converting to JSON", () => {
  //   const plugin: string = "Test-Plugin";
  //   const node: string = "Node";
  //   const description: string = "This is a node";
  //   const icon: string = "fa-diagram-project";

  //   let inputs1: MinAnchor[] = [];
  //   let inputs2: MinAnchor[] = [];
  //   let outputs1: MinAnchor[] = [];
  //   let outputs2: MinAnchor[] = [];

  //   inputs1.push(
  //   { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
  //   { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
  //   { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

  //   outputs1.push(
  //   { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
  //   { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

  //   inputs2.push(
  //   { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
  //   { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
  //   { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
  //   outputs2.push(
  //   { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
  //   { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 
  
  //   const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
  //   const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    
  //   const response = graph.addNode(node1Instance);
  //   const uuid1 = (response.data! as { nodeId: UUID }).nodeId;
  //   const response2 = graph.addNode(node2Instance);
  //   const uuid2 = (response2.data! as { nodeId: UUID }).nodeId;

  //   const node1Node = graph.getNodes[uuid1];
  //   const node2Node = graph.getNodes[uuid2];

  //   const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
  //   const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

  //   let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom, anchorTo);
  //   expect(result.status).toBe("success");

  //   let edges = graph.edgesToJSONObject();
  //   expect(edges).toStrictEqual([
  //     {
  //       anchorFrom: {
  //         parent: uuid1,
  //         id: anchorFrom
  //       },
  //       anchorTo: {
  //         parent: uuid2,
  //         id: anchorTo
  //       }
  //     }])

  // });
  // test("Test graph converting to JSON", () => {
  //   const plugin: string = "Test-Plugin";
  //   const node: string = "Node";
  //   const description: string = "This is a node";
  //   const icon: string = "fa-diagram-project";

  //   let inputs1: MinAnchor[] = [];
  //   let inputs2: MinAnchor[] = [];
  //   let outputs1: MinAnchor[] = [];
  //   let outputs2: MinAnchor[] = [];

  //   inputs1.push(
  //   { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
  //   { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
  //   { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

  //   outputs1.push(
  //   { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
  //   { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

  //   inputs2.push(
  //   { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
  //   { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
  //   { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
  //   outputs2.push(
  //   { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
  //   { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 
  
  //   const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
  //   const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);
    
  //   const response = graph.addNode(node1Instance);
  //   const uuid1 = (response.data! as { nodeId: UUID }).nodeId;
  //   const response2 = graph.addNode(node2Instance);
  //   const uuid2 = (response2.data! as { nodeId: UUID }).nodeId;

  //   const node1Node = graph.getNodes[uuid1];
  //   const node2Node = graph.getNodes[uuid2];

  //   const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
  //   const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input

  //   let result: QueryResponse<{ edgeId: string }> = graph.addEdge(anchorFrom, anchorTo);
  //   expect(result.status).toBe("success");

  //   let graphJSON = graph.exportJSON();
  //   expect(graphJSON).toStrictEqual(
  //     {
  //       nodes: graph.nodesToJSONObject(),
  //       edges: graph.edgesToJSONObject(),
  //     });

  //   // console.log(JSON.stringify(graphJSON, null, 2))

  //   expect(graphJSON).toStrictEqual(
  //     {
  //       nodes: [
  //         {
  //           signature: `${plugin}.${node}-1`,
  //           styling: undefined
  //         },
  //         {
  //           signature: `${plugin}.${node}-2`,
  //           styling: undefined
  //         }
  //       ],
  //       edges: [
  //         {
  //           anchorFrom: {
  //             parent: uuid1,
  //             id: anchorFrom
  //           },
  //           anchorTo: {
  //             parent: uuid2,
  //             id: anchorTo
  //           }
  //         }
  //       ]
  //     });
  // });
});

describe("Test NodesAndEdgesGraph Class ", () => {
  test("Create an object", () => {
    const graphRep = new NodesAndEdgesGraph("id", {}, {});
    expect(graphRep).toBeDefined();

    const g = new CoreGraph();

    const plugin: string = "Test-Plugin";
    const node: string = "Node";
    const description: string = "This is a node";
    const icon: string = "fa-diagram-project";

    let inputs1: MinAnchor[] = [];
    let inputs2: MinAnchor[] = [];
    let outputs1: MinAnchor[] = [];
    let outputs2: MinAnchor[] = [];

    inputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-1.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-1.2`, identifier: `in3` });

    outputs1.push(
    { type: "string", displayName: `Test-plugin.Node-1.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-1.4`, identifier: `out2` }); 

    inputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.0`, identifier: `in1` },
    { type: "string", displayName: `Test-plugin.Node-2.1`, identifier: `in2` },
    { type: "string", displayName: `Test-plugin.Node-2.2`, identifier: `in3` });
  
    outputs2.push(
    { type: "string", displayName: `Test-plugin.Node-2.3`, identifier: `out1` },
    { type: "number", displayName: `Test-plugin.Node-2.4`, identifier: `out2` }); 
  
    const node1Instance = new NodeInstance(`${node}-${1}`, `${plugin}`, `${node}-1`, description, icon, inputs1, outputs1);
    const node2Instance = new NodeInstance(`${node}-${2}`, `${plugin}`, `${node}-2`, description, icon, inputs2, outputs2);

    const pos = { x: 0, y: 0 };
    g.addNode(node1Instance, pos);
    g.addNode(node2Instance, pos);
    

    const node1Node = Object.values(g.getNodes)[0];
    const node2Node = Object.values(g.getNodes)[1];
    const anchorFrom: UUID = Object.keys(node1Node.getAnchors)[3]; // output
    const anchorTo: UUID = Object.keys(node2Node.getAnchors)[0]; // input
    let result: QueryResponse<{ edgeId: string}> = g.addEdge(anchorFrom, anchorTo);

    const exported = g.exportNodesAndEdges();

    expect(exported).toBeDefined()

  });
})

describe("Test NodeOutToNodeIn Class ", () => {
  test("Create an object", () => {
    const nodeOutNodeIn = new NodeOutToNodeIn("id");
    expect(nodeOutNodeIn).toBeDefined();
  });
})

describe("Test Reduced Graph Component Classes ", () => {
  test("Create a ReducedNode object", () => {

    const styling = new NodeStyling({ x: 6, y: 9 }, { w: 6, h: 9 });
    expect(styling.getPosition).toStrictEqual({ x: 6, y: 9 });
    expect(styling.getSize).toStrictEqual({ w: 6, h: 9 });

    const node = new ReducedNode("id","signa.ture", styling,{},{});
    expect(node).toBeDefined();


  });

  test("Create a ReducedEdge object", () => {
    const edge = new ReducedEdge("id", "nodeUUIDFrom", "nodeUUIDTo", "anchorIdFrom", "anchorIdTo");
    expect(edge).toBeDefined();
  });

  test("Create a ReducedAnchor object", () => {
    const anchor = new ReducedAnchor("id", "type", "displayName");
    expect(anchor).toBeDefined();
  })
})



});
