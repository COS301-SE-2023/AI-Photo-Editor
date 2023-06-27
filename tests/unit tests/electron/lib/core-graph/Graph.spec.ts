import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUIParent, NodeUILeaf,ToolboxRegistry } from "../../../../../src/electron/lib/core-graph/ToolboxRegistry";
import { CoreGraph } from "../../../../../src/electron/lib/core-graph/Graph";

describe("Test toolbox", () => {


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




});



});
