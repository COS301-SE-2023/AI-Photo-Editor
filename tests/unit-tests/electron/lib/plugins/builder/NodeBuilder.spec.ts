import expect from "expect";
import { NodeInstance, InputAnchorInstance, OutputAnchorInstance, ToolboxRegistry, MinAnchor } from "../../../../../../src/electron/lib/registries/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUI, NodeUIParent } from "../../../../../../src/shared/ui/NodeUITypes";

describe("Test NodeBuilder", () => {


 describe("Test getters and setters", () => {
  let nodeBuilder : NodeBuilder;
  let nodeUIBuilder : NodeUIBuilder;


  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];


  beforeEach(() => {
    jest.clearAllMocks();


    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    const nodeUI = new NodeUIParent("", null);

    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 1");
    nodeUIBuilder = new NodeUIBuilder();
  });

  test("nodeUIBuilder should be instantiated", () => {
    const node = new NodeUIParent("", null);
    nodeUIBuilder = new NodeUIBuilder();

    expect(nodeUIBuilder.getUI()).toEqual(node);
  });

  test("getBuild should return NodeInstance", () => {
    const node = new NodeInstance("cool node 1", "testing-plugin", "Jake", "The Jake plugin","", inputs, outputs);
    nodeBuilder.setTitle("Jake");
    nodeBuilder.setDescription("The Jake plugin");
    nodeBuilder.define(() => null);
    expect(JSON.stringify(nodeBuilder.build)).toEqual(JSON.stringify(node));
  });

  test("setTitle should set the title", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 3");
    nodeBuilder.setTitle("Jake");
    expect(nodeBuilder["partialNode"].displayName).toEqual("Jake");  });

  test("setDescription should set the description", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 3");
    nodeBuilder.setDescription("The Jake plugin");
    expect(nodeBuilder["partialNode"].description).toEqual("The Jake plugin");
  });

  test("define should set the function", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 4");
    nodeBuilder.define(() => {return "Shrek";});
    expect(nodeBuilder["partialNode"].func(null)).toEqual("Shrek");
  });

});

describe("Test NodeBuilder", () => {

  let nodeBuilder : NodeBuilder;
  let nodeUIBuilder : NodeUIBuilder;


  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 5");
    nodeUIBuilder = new NodeUIBuilder();
  });

  test("addIcon should add an icon", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 6");
    nodeBuilder.addIcon("Shrek");
    expect(nodeBuilder["partialNode"].icon).toEqual("Shrek");
  });

  test("addInput should add an input", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 7");
    nodeBuilder.addInput("string", "shrek", "Shrek");
    expect(nodeBuilder["partialNode"].inputs[0].displayName).toEqual("Shrek");
  });

  test("addOutput should add an output", () => {
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 8");
    nodeBuilder.addOutput("string", "shrek2", "Shrek");
    expect(nodeBuilder["partialNode"].outputs[0].displayName).toEqual("Shrek");
  });

});

describe("Test NodeUIBuilder", () => {
    let nodeBuilder : NodeBuilder;
    let nodeUIBuilder : NodeUIBuilder;

    beforeEach(() => {
      jest.clearAllMocks();

      nodeBuilder = new NodeBuilder("testing-plugin", "cool node 9");
      nodeUIBuilder = new NodeUIBuilder();
    });


    test("addButton should add a button", () => {
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addButton("shrek",() => {return "Shrek";});

      expect(nodeUIBuilder["node"].params[0].label).toEqual("shrek");
      expect(nodeUIBuilder["node"].params[0].params[0]()).toEqual("Shrek");
      expect(nodeUIBuilder["node"].params[0].type).toEqual("leaf");
      expect(nodeUIBuilder["node"].params[0].parent).toEqual(nodeUIBuilder["node"]);
    });

    test("addNumberInput should add a numberInput", () => {
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addNumberInput("shrek");

      expect(nodeUIBuilder["node"].params[0].label).toEqual("shrek");
      expect(nodeUIBuilder["node"].params[0].params).toEqual([]);
    });

    test("addImageInput should add a ", () => {
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addImageInput("shrek");

      expect(nodeUIBuilder["node"].params[0].label).toEqual("shrek");
      expect(nodeUIBuilder["node"].params[0].params).toEqual([]);
    });

    test("addColorPicker should add a color picker", () => {
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addColorPicker("shrek",["rgb"]);

      expect(nodeUIBuilder["node"].params[0].label).toEqual("shrek");
      expect(nodeUIBuilder["node"].params[0].params[0]).toEqual(["rgb"]);
    });

    test("getUI should return the nodeUI", () => {
      nodeUIBuilder = new NodeUIBuilder();
      expect(nodeUIBuilder.getUI()).toEqual(nodeUIBuilder["node"]);
    });

    test("addLabel should add a label", () => {
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addLabel("shrek","GET OUT OF MA SWAMP!");

      expect(nodeUIBuilder['node'].params[0].label).toEqual("shrek");
      expect(nodeUIBuilder['node'].params[0].params[0]).toEqual("GET OUT OF MA SWAMP!");
    });
  });




});
