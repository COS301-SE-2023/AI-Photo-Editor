import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, ToolboxRegistry } from "../../../../../../src/electron/lib/registries/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUIParent } from "../../../../../../src/shared/ui/NodeUITypes";

describe("Test NodeBuilder", () => {


 describe("Test getters and setters", () => {
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

  test("nodeBuilder should be validated", () => {
    const node = new NodeInstance("", "", "", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);

    expect(() => nodeBuilder.validate()).toThrow("Node is not instantiated");

    nodeBuilder.instantiate("Spooderman", "Shrek");

    expect(() => nodeBuilder.validate()).not.toThrow("Node is not instantiated");


    nodeBuilder.setUI(nodeBuilder.createUIBuilder());
    expect(nodeBuilder.validate()).toReturn;
  });

  test("nodeBuilder should be instantiated", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.instantiate("Spooderman", "Shrek");

    expect(node.getName).toEqual("Shrek");
    expect(node.getPlugin).toEqual("Spooderman");
    expect(node.getSignature).toEqual("Spooderman.Shrek");

    expect(() => nodeBuilder.instantiate("","")).toThrow("Plugin or name is not instantiated");
  });

  test("nodeUIBuilder should be instantiated", () => {
    const node = new NodeUIParent("Jake.Shark", null);
    nodeUIBuilder = new NodeUIBuilder(node);

    expect(nodeUIBuilder.getUI()).toEqual(node);
  });

  test("getBuild should return null", () => {
    expect(nodeBuilder.build).toEqual(null);
  });

  test("setTitle should set the title", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.setTitle("Shrek");
    expect(node.getTitle).toEqual("Shrek");
  });

  test("setDescription should set the description", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.setDescription("Shrek");
    expect(node.getDescription).toEqual("Shrek");
  });

  test("define should set the function", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.define(() => {return "Shrek";});
    expect(node.getFunction()).toEqual("Shrek");
  });

});

describe("Test NodeBuilder", () => {

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

  test("addIcon should add an icon", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.addIcon("Shrek");
    expect(node.getIcon).toEqual("Shrek");
  });

  test("addInput should add an input", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.addInput("string", "shrek", "Shrek");
    expect(node.getInputAnchorInstances[0].displayName).toEqual("Shrek");
  });

  test("addOutput should add an output", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    nodeBuilder = new NodeBuilder(node);
    nodeBuilder.addOutput("string", "shrek2", "Shrek");
    expect(node.getOutputAnchorInstances[0].displayName).toEqual("Shrek");
  });

});

describe("Test NodeUIBuilder", () => {
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


    test("addButton should add a button", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      nodeUIBuilder.addButton("shrek",() => {return "Shrek";});

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]()).toEqual("Shrek");
      expect(nodeUI.params[0].type).toEqual("leaf");
      expect(nodeUI.params[0].parent).toEqual(nodeUI);
    });

    test("addNumberInput should add a numberInput", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      nodeUIBuilder.addNumberInput("shrek");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params).toEqual([]);
    });

    test("addImageInput should add a ", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      nodeUIBuilder.addImageInput("shrek");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params).toEqual([]);
    });

    test("addColorPicker should add a color picker", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      nodeUIBuilder.addColorPicker("shrek",["rgb"]);

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]).toEqual(["rgb"]);
    });

    test("getUI should return the nodeUI", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      expect(nodeUIBuilder.getUI()).toEqual(nodeUI);
    });

    test("addLabel should add a label", () => {
      const nodeUI = new NodeUIParent("Jake.Shark", null);
      nodeUIBuilder = new NodeUIBuilder(nodeUI);
      nodeUIBuilder.addLabel("shrek","GET OUT OF MA SWAMP!");

      expect(nodeUI.params[0].label).toEqual("shrek");
      expect(nodeUI.params[0].params[0]).toEqual("GET OUT OF MA SWAMP!");
    });
  });




});
