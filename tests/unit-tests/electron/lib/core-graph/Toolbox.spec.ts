import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, ToolboxRegistry, MinAnchor } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { NodeUIBuilder } from "../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../../../src/shared/ui/NodeUITypes";

describe("Test toolbox", () => {


 describe("Test getters and setters", () => {
  let node : NodeInstance;

  const inputs: MinAnchor[] = [];
  const outputs: MinAnchor[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeInstance("Shark", "Jake", "Shark.Jake", "The Jake plugin", "1149", inputs, outputs);
  });

  test("getId should be defined", () => {
    expect(node.id).toBeDefined();
  });

  test("getSignature should return the correct signature", () => {
    expect(node.signature).toEqual("Jake.Shark");
  });

  test("getDescription should return the correct description", () => {
    expect(node.description).toEqual("The Jake plugin");
  });

  test("getTitle should return the correct Title", () => {
    expect(node.displayName).toEqual("Shark.Jake");
  });

  test("getIcon should return the correct icon", () => {
    expect(node.icon).toEqual("1149");
  });

  test("getInputAnchorInstances should return the correct inputs", () => {
    expect(node.inputs).toEqual(inputs);
  });

  test("getOutputAnchorInstances should return the correct outputs", () => {
    expect(node.outputs).toEqual(outputs);
  });

  test("getFunction should return the correct function", () => {
    expect(node.getFunction()).toEqual(null);
  });

  test("getUI should return ui", () => {
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    expect(nod.ui).toEqual(null);
  });

  test("getPlugin should return plugin", () => {
    expect(node.plugin).toEqual("Jake");
  });

  test("getName should return name", () => {
    expect(node.name).toEqual("Shark");
  });

});


describe("Test Node ui", () => {
  let node : NodeUIParent;
  let builder: NodeUIBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeUIParent("Root",null);
    builder = new NodeUIBuilder();
  });

  test("nodeParent should be instantiated properly", () => {
    const node = new NodeUIParent("Root",null);

    expect(node.label).toEqual("Root");
    expect(node.parent).toEqual(null);
    expect(node.params).toEqual([]);
    expect(node.type).toEqual("parent");
  });

  test("nodeLeaf should be instantiated properly", () => {
    const nod = new NodeUILeaf(node,NodeUIComponent.Button,"leaf",[10]);

    expect(nod.label).toEqual("leaf");
    expect(nod.parent).toEqual(node);
    expect(nod.params).toEqual([10]);
    expect(nod.type).toEqual("leaf");
    expect(nod.category).toEqual("Button");
  });

  test("nodeParent should add button", () => {
    builder.addButton("Button",() => {
         return 1;
        });
      
    expect(builder["node"].params[0].label).toEqual("Button");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]()).toEqual(1);
  });

  test("nodeParent should add Slider", () => {
    builder.addSlider("Slider",0,100,50,1);
      
    expect(builder["node"].params[0].label).toEqual("Slider");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual(0);
    expect(builder["node"].params[0].params[1]).toEqual(100);
    expect(builder["node"].params[0].params[2]).toEqual(50);
    expect(builder["node"].params[0].params[3]).toEqual(1);
  });

  test("nodeParent should add Dropdown", () => {

    const nod = new NodeUIParent("Root",null);
    const builder2 = new NodeUIBuilder();

    builder.addDropdown("My Dropdown", builder2);
      
    expect(builder["node"].params[0].label).toEqual("My Dropdown");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("parent");
    expect(builder["node"].params[0].params).toEqual([]);
  });

  test("nodeParent should add Label", () => {
    builder.addLabel("My label","Attack the D point!");
      
    expect(builder["node"].params[0].label).toEqual("My label");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual("Attack the D point!");
  });

  test("nodeParent should add numberInput", () => {
    builder.addNumberInput("input number");
      
    expect(builder["node"].params[0].label).toEqual("input number");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
  });

  test("nodeParent should add imageInput", () => {
    builder.addImageInput("Image input");
      
    expect(builder["node"].params[0].label).toEqual("Image input");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
  });

//This must change later to match data type
  test("nodeParent should add colorInput", () => {
    builder.addColorPicker("a color picker",1);
      
    expect(builder["node"].params[0].label).toEqual("a color picker");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual(1);
  });

});


describe("Test Toolbox registry", () => {
  let box : ToolboxRegistry;

  let inputs: MinAnchor[];
  let outputs: MinAnchor[] ;

  beforeEach(() => {
    jest.clearAllMocks();
    box = new ToolboxRegistry();
    inputs= [];
    outputs= [];
  });

  test("ToolboxRegistry should be instantiated properly", () => {
    box = new ToolboxRegistry();
    expect(box).toBeDefined();
  });

  test("ToolboxRegistry should add and return registrys properly", () => {
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", inputs, outputs);
    box.addInstance(node);
    expect(box.getRegistry()[node.signature]).toEqual(node);
  });

  });


});
