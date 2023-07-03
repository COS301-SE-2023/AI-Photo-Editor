import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, ToolboxRegistry } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { NodeUIBuilder } from "../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUILeaf, NodeUIParent } from "../../../../../src/shared/ui/NodeUI";

describe("Test toolbox", () => {


 describe("Test getters and setters", () => {
  let node : NodeInstance;

  const inputs: InputAnchorInstance[] = [];
  const outputs: OutputAnchorInstance[] = [];


  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
  });

  test("getId should be defined", () => {
    expect(node.id).toBeDefined();
  });

  test("getSignature should return the correct signature", () => {
    expect(node.getSignature).toEqual("Jake.Shark");
  });

  test("getDescription should return the correct description", () => {
    expect(node.getDescription).toEqual("This is the Jake plugin");
  });

  test("getTitle should return the correct Title", () => {
    expect(node.getTitle).toEqual("The Jake plugin");
  });

  test("getIcon should return the correct icon", () => {
    expect(node.getIcon).toEqual("1149");
  });

  test("getInputAnchorInstances should return the correct inputs", () => {
    expect(node.getInputAnchorInstances).toEqual(inputs);
  });

  test("getOutputAnchorInstances should return the correct outputs", () => {
    expect(node.getOutputAnchorInstances).toEqual(outputs);
  });

  test("getFunction should return the correct function", () => {
    expect(node.getFunction()).toEqual("");
  });

  test("getUI should return ui", () => {
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    expect(nod.getUI).toEqual(null);
  });

  test("getPlugin should return plugin", () => {
    expect(node.getPlugin).toEqual("Jake");
  });

  test("getName should return name", () => {
    expect(node.getName).toEqual("Shark");
  });
  test("setUI should set ui", () => {
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    const nodeUI = new NodeUIParent("ui",null);
    nod.setUI(nodeUI);
    expect(nod.getUI?.label).toEqual("ui");
  });

  test("setTitle should set title", () => {
    node.setTitle("Rip Jake")
    expect(node.getTitle).toEqual("Rip Jake");
  });

  test("setDescription should set description", () => {
    node.setDescription("This is not the Jake Plugin")
    expect(node.getDescription).toEqual("This is not the Jake Plugin");
  });


  test("setIcon should set icon", () => {
    node.setIcon("1150")
    expect(node.getIcon).toEqual("1150");
  });

  test("setFunction should set function", () => {
    node.setFunction(() => {
      return "Shark2";
    });

    expect(node.getFunction()).toStrictEqual("Shark2");

  });

  test("Instantiate should initialize", () => {
    node.instantiate("Quack","Duck");
    expect(node.getSignature).toEqual("Quack.Duck");
    expect(node.getPlugin).toEqual("Quack");
    expect(node.getName).toEqual("Duck");
  });

});


describe("Test anchors", () => {
  let node : NodeInstance;

  const inputs: InputAnchorInstance[] = [];
  const outputs: OutputAnchorInstance[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
  }); 


  test("addInputAnchor should add input anchor", () => {
    node.addInput("string","anchor1");
    const id = node.getPlugin + "." + node.getName + "." + "anchor1";

    expect(node.getInputAnchorInstances[0].displayName).toEqual("anchor1");
    expect(node.getInputAnchorInstances[0].type).toEqual("string");
    expect(node.getInputAnchorInstances[0].signature).toEqual(id);

  });

  test("addOutputAnchor should add output anchor", () => {
    node.addOutput("string","anchor2");
    const id = node.getPlugin + "." + node.getName + "." + "anchor2";

    expect(node.getOutputAnchorInstances[0].displayName).toEqual("anchor2");
    expect(node.getOutputAnchorInstances[0].type).toEqual("string");
    expect(node.getOutputAnchorInstances[0].signature).toEqual(id);

  });
});

describe("Test Node ui", () => {
  let node : NodeUIParent;
  let builder: NodeUIBuilder;

  beforeEach(() => {
    jest.clearAllMocks();
    node = new NodeUIParent("Root",null);
    builder = new NodeUIBuilder(node);
  });

  test("nodeParent should be instantiated properly", () => {
    const node = new NodeUIParent("Root",null);

    expect(node.label).toEqual("Root");
    expect(node.parent).toEqual(null);
    expect(node.params).toEqual([]);
    expect(node.type).toEqual("parent");
  });

  test("nodeLeaf should be instantiated properly", () => {
    const nod = new NodeUILeaf("Button","leaf",[10],node);

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
      
    expect(node.params[0].label).toEqual("Button");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
    expect(node.params[0].params[0]()).toEqual(1);
  });

  test("nodeParent should add Slider", () => {
    builder.addSlider("Slider",0,100,50,1);
      
    expect(node.params[0].label).toEqual("Slider");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
    expect(node.params[0].params[0]).toEqual(0);
    expect(node.params[0].params[1]).toEqual(100);
    expect(node.params[0].params[2]).toEqual(50);
    expect(node.params[0].params[3]).toEqual(1);
  });

  test("nodeParent should add Dropdown", () => {

    const nod = new NodeUIParent("Root",null);
    const builder2 = new NodeUIBuilder(nod);

    builder.addDropdown("My Dropdown", builder2);
      
    expect(node.params[0].label).toEqual("My Dropdown");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("parent");
    expect(node.params[0].params).toEqual([]);
  });

  test("nodeParent should add Label", () => {
    builder.addLabel("My label","Attack the D point!");
      
    expect(node.params[0].label).toEqual("My label");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
    expect(node.params[0].params[0]).toEqual("Attack the D point!");
  });

  test("nodeParent should add numberInput", () => {
    builder.addNumberInput("input number");
      
    expect(node.params[0].label).toEqual("input number");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
  });

  test("nodeParent should add imageInput", () => {
    builder.addImageInput("Image input");
      
    expect(node.params[0].label).toEqual("Image input");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
  });

//This must change later to match data type
  test("nodeParent should add colorInput", () => {
    builder.addColorPicker("a color picker",1);
      
    expect(node.params[0].label).toEqual("a color picker");
    expect(node.params[0].parent).toEqual(node);
    expect(node.params[0].type).toEqual("leaf");
    expect(node.params[0].params[0]).toEqual(1);
  });

});


describe("Test Toolbox registry", () => {
  let box : ToolboxRegistry;

  let inputs: InputAnchorInstance[];
  let outputs: OutputAnchorInstance[] ;

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
    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
    box.addInstance(node);
    expect(box.getRegistry()[node.getSignature]).toEqual(node);
  });

  test("getNodes should return nodes", () => {
    box = new ToolboxRegistry();
    let nodes : NodeInstance[] = [];

    for(let i = 0; i < 10; i++){
      const node = new NodeInstance("Jake"+i.toString()+".Shark", "Shark", "Jake"+i.toString(), "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);
      box.addInstance(node);
      nodes.push(node);
    }

    const anchor = new InputAnchorInstance("anchor1", "string", "Jake.Shark.anchor1");
    const anchor2 = new OutputAnchorInstance("anchor2", "string", "Jake.Shark.anchor2");

    const node = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", [anchor], [anchor2]);
    box.addInstance(node);
    nodes.push(node);

    const nods = box.getNodes();
    for(let i = 0; i < 11; i++){
      expect(nods[i].signature).toEqual(nodes[i].getSignature);
    }


    box = new ToolboxRegistry();
    const nod = new NodeInstance("Jake.Shark", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs);

    box.addInstance((nod));
    box.addInstance(new NodeInstance("", "Shark", "Jake", "The Jake plugin", "This is the Jake plugin", "1149", inputs, outputs));
    expect(box.getNodes()[0].description).toEqual(nod.getDescription);
  });
  });


});
