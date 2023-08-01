import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, ToolboxRegistry, MinAnchor } from "../../../../../src/electron/lib/registries/ToolboxRegistry";
import { NodeUIBuilder } from "../../../../../src/electron/lib/plugins/builders/NodeBuilder"
import { NodeUIComponent, NodeUILeaf, NodeUIParent } from "../../../../../src/shared/ui/NodeUITypes";
import { UIComponentConfig } from "../../../../../src/shared/ui/NodeUITypes";

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
    expect(node.getFunction()).toEqual({});
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
    const nod = new NodeUILeaf(node,NodeUIComponent.Button,"leaf",[{exec : 10}]);

    expect(nod.label).toEqual("leaf");
    expect(nod.parent).toEqual(node);
    expect(nod.params).toEqual([{exec : 10}]);
    expect(nod.type).toEqual("leaf");
    expect(nod.category).toEqual("Button");
  });

  test("nodeParent should add button", () => {
    const uiComponentConfig : UIComponentConfig = {
            label: "button",
            componentId: "Button",
            defaultValue: 50,
            updatesBackend: true
      }  
    builder.addButton(uiComponentConfig,{exec : 1});
      
    expect(builder["node"].params[0].label).toEqual("Button");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual({exec :1});
  });

  test("nodeParent should add Slider", () => {
          const uiComponentConfig : UIComponentConfig = {
            label: "slider",
            componentId: "Slider",
            defaultValue: 50,
            updatesBackend: true
      }  
    builder.addSlider(uiComponentConfig,{ min: 0, max: 100, step: 0.1 });
      
    expect(builder["node"].params[0].label).toEqual("Slider");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual({ min: 0, max: 100, step: 0.1 });
  });

  test("nodeParent should add Dropdown", () => {

    const nod = new NodeUIParent("Root",null);
    const builder2 = new NodeUIBuilder();

        const uiComponentConfig : UIComponentConfig = {
          label: "dropdown",
          componentId: "Dropdown",
          defaultValue: 50,
          updatesBackend: true
        }
   

    builder.addDropdown(uiComponentConfig,{label: "A", value: 1});
      
    expect(builder["node"].params[0].label).toEqual("Dropdown");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(JSON.stringify(builder["node"].params[0].params[0])).toBe(JSON.stringify({label: "A", value: 1}));
  });

  test("nodeParent should add Label", () => {
      const uiComponentConfig : UIComponentConfig = {
        label: "label",
        componentId: "Label",
        defaultValue: 50,
        updatesBackend: true
      }

    builder.addLabel(uiComponentConfig,{type : "Attack the D point!"});
      
    expect(builder["node"].params[0].label).toEqual("Label");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual({ type : "Attack the D point!"});
  });

  test("nodeParent should add numberInput", () => {
      const uiComponentConfig : UIComponentConfig = {
        label: "numberInput",
        componentId: "InputNum",
        defaultValue: 50,
        updatesBackend: true
      }

    builder.addNumberInput(uiComponentConfig,{min : 0, max : 100, step : 0.1});
      
    expect(builder["node"].params[0].label).toEqual("InputNum");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toBeDefined();
  });

  test("nodeParent should add imageInput", () => {
      const uiComponentConfig : UIComponentConfig = {
        label: "label",
        componentId: "InputImg",
        defaultValue: 50,
        updatesBackend: true
      }

    builder.addImageInput(uiComponentConfig,{type : "Attack the D point!"});

    expect(builder["node"].params[0].label).toEqual("InputImg");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
  });

//This must change later to match data type
  test("nodeParent should add colorInput", () => {
      const uiComponentConfig : UIComponentConfig = {
        label: "label",
        componentId: "ColorPicker",
        defaultValue: 50,
        updatesBackend: true
      }

    builder.addColorPicker(uiComponentConfig,{type : "Attack the D point!"});
      
    expect(builder["node"].params[0].label).toEqual("ColorPicker");
    expect(builder["node"].params[0].parent).toEqual(builder["node"]);
    expect(builder["node"].params[0].type).toEqual("leaf");
    expect(builder["node"].params[0].params[0]).toEqual({type : "Attack the D point!"});
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
