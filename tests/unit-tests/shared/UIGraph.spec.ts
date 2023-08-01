import { UIGraph,GraphNode,GraphEdge,GraphAnchor } from "../../../src/shared/ui/UIGraph";




  describe("Test UiGraph", () => {
    let uiGraph : UIGraph;
    let node : GraphNode;
    let edge : GraphEdge;
    let anchor : GraphAnchor;

    beforeEach(() => {
      uiGraph = new UIGraph("Unique id");
        node = new GraphNode("Another Unique id");
        edge = new GraphEdge("Another Unique id", "Another Unique id", "Another Unique id", "Another Unique id", "Another Unique id");
        anchor = new GraphAnchor("Another Unique id", "Another Unique id");
    });

    // This file only consists of constructors, so we only test those

    test("Test constructors", () => {
      expect(uiGraph).toBeDefined();
      expect(node).toBeDefined();
      expect(edge).toBeDefined();
      expect(anchor).toBeDefined();
    })

    test("Instantiate pos", () => {
        node = new GraphNode("Another Unique id", {x: 10, y: 10});
        expect(node.styling).toBeDefined();
    })
  });