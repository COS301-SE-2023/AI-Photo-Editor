import expect from "expect";
import { NodeInstance, InputAnchorInstance, OutputAnchorInstance, ToolboxRegistry, MinAnchor } from "../../../../../../src/electron/lib/registries/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUIParent } from "../../../../../../src/shared/ui/NodeUITypes";

describe("Test NodeBuilder", () => {


 describe("Test getters and setters", () => {
  let nodeBuilder : NodeBuilder;
  let nodeUIBuilder : NodeUIBuilder;


  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];


  beforeEach(() => {
    jest.clearAllMocks();


    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    const nodeUI = new NodeUIParent("Jake.Shark", null);

    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 1");
    nodeUIBuilder = new NodeUIBuilder();
  });

  test("nodeUIBuilder should be instantiated", () => {
    const node = new NodeUIParent("Jake.Shark", null);
    nodeUIBuilder = new NodeUIBuilder();

    expect(nodeUIBuilder.getUI()).toEqual(node);
  });

  test("getBuild should return null", () => {
    expect(nodeBuilder.build).toEqual(null);
  });

  test("setTitle should set the title", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 2");
    nodeBuilder.setTitle("Shrek");
    expect(node.displayName).toEqual("Shrek");
  });

  test("setDescription should set the description", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 3");
    nodeBuilder.setDescription("Shrek");
    expect(node.description).toEqual("Shrek");
  });

  test("define should set the function", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 4");
    nodeBuilder.define(() => {return "Shrek";});
    expect(node.getFunction()).toEqual("Shrek");
  });

});

describe("Test NodeBuilder", () => {

  let nodeBuilder : NodeBuilder;
  let nodeUIBuilder : NodeUIBuilder;


  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];


  beforeEach(() => {
    jest.clearAllMocks();


    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    const nodeUI = new NodeUIParent("Jake.Shark", null);

    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 5");
    nodeUIBuilder = new NodeUIBuilder();
  });

  test("addIcon should add an icon", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 6");
    nodeBuilder.addIcon("Shrek");
    expect(node.icon).toEqual("Shrek");
  });

  test("addInput should add an input", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 7");
    nodeBuilder.addInput("string", "shrek", "Shrek");
    expect(node.inputs[0].displayName).toEqual("Shrek");
  });

  test("addOutput should add an output", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    nodeBuilder = new NodeBuilder("testing-plugin", "cool node 8");
    nodeBuilder.addOutput("string", "shrek2", "Shrek");
    expect(node.outputs[0].displayName).toEqual("Shrek");
  });

});

describe("Test NodeUIBuilder", () => {
    let nodeBuilder : NodeBuilder;
    let nodeUIBuilder : NodeUIBuilder;
  
    const inputs: MinAnchor[] = [];
    const outputs: MinAnchor[] = [];
    beforeEach(() => {
      jest.clearAllMocks();
  
  
      const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
      const nodeUI = new NodeUIParent("Jake.Shark", null);
  
      nodeBuilder = new NodeBuilder("testing-plugin", "cool node 9");
      nodeUIBuilder = new NodeUIBuilder();
    });


    test("addButton should add a button", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addButton("shrek",() => {return "Shrek";});

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]()).toEqual("Shrek");
      expect(nodeUI.params[0].type).toEqual("leaf");
      expect(nodeUI.params[0].parent).toEqual(nodeUI);
    });

    test("addNumberInput should add a numberInput", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addNumberInput("shrek");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params).toEqual([]);
    });

    test("addImageInput should add a ", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addImageInput("shrek");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params).toEqual([]);
    });

    test("addColorPicker should add a color picker", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addColorPicker("shrek",["rgb"]);

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]).toEqual(["rgb"]);
    });

    test("getUI should return the nodeUI", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      expect(nodeUIBuilder.getUI()).toEqual(nodeUI);
    });

    test("addLabel should add a label", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder();
      nodeUIBuilder.addLabel("shrek","GET OUT OF MA SWAMP!");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]).toEqual("GET OUT OF MA SWAMP!");
    });
  });




});
