import expect from "expect";
import { NodeInstance,InputAnchorInstance,OutputAnchorInstance, NodeUIParent, NodeUILeaf,ToolboxRegistry } from "../../../src/electron/lib/core-graph/ToolboxRegistry";
import {NodeBuilder,NodeUIBuilder} from "../../../src/electron/lib/plugins/builders/NodeBuilder"

describe("Test plugins", () => {

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

    test("Adding a slider should affect nodeUI's paramaters", () => {
        const nodeUI = new NodeUIParent("Jake.Shark", null);
        nodeUIBuilder = new NodeUIBuilder(nodeUI);
        nodeUIBuilder.addSlider("shrek",0,100,50,1);
  
        expect(nodeUI.params[0].label).toEqual("shrek");
        expect(nodeUI.params[0].parent).toEqual(nodeUI);
        expect(nodeUI.params[0].type).toEqual("leaf");
        expect(nodeUI.params[0].params).toEqual([0,100,50,1]);
      });
  
      test("addDropdown should affect nodeUi's children", () => {
        const nodeUI = new NodeUIParent("Jake.Shark", null);
        nodeUIBuilder = new NodeUIBuilder(nodeUI);
        nodeUIBuilder.addDropdown("shrek",nodeBuilder.createUIBuilder().addButton("Shrek",() => {return "Shrek";}));
  
        expect(nodeUI.params[0].label).toEqual("shrek");
        expect(nodeUI.params[0].parent).toEqual(nodeUI);
        expect(nodeUI.params[0].type).toEqual("parent");
        expect(nodeUI.params[0].params[0].label).toEqual("Shrek");
      });
});
