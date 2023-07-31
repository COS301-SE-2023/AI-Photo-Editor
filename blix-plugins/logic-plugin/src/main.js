const nodes ={
    "not": (context) => {
        nodeBuilder = context.instantiate("logic-plugin","not");
        nodeBuilder.setTitle("Not");
        nodeBuilder.setDescription("Performs Boolean NOT operation on a single input and returns a single output");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
            const boolIn = anchorInputs.in ?? false;
            return { res: !boolIn };
        });

        nodeBuilder.addInput("boolean", "in","In");
        nodeBuilder.addOutput("boolean", "res","Result");
    },
    "logic": (context) => {
        const nodeBuilder = context.instantiate("logic-plugin", "logic");
        nodeBuilder.setTitle("Logic");
        nodeBuilder.setDescription("Performs a logical operation (AND/OR/XOR) on two inputs and returns a single output");
      
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const state = Math.min(uiInputs?.state ?? 0, 2);
          const boolA = anchorInputs.boolA ?? false;
          const boolB = anchorInputs.boolB ?? false;
          switch (state) {
            case 0: return { res: boolA && boolB  }
            case 1: return { res: boolA || boolB  }
            case 2: return { res: boolA !== boolB }
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "state",
            label: "State",
            defaultValue: 0,
            updateBackend: true,
        }, {
          options: {
            "And": 0,
            "Or": 1,
            "Xor": 2,
          }
        });

        nodeBuilder.setUI(ui);
      
        nodeBuilder.addInput("boolean", "boolA", "A");
        nodeBuilder.addInput("boolean", "boolB", "B");
        nodeBuilder.addOutput("boolean", "res", "Result");
      },
    "compare": (context) => {
        const nodeBuilder = context.instantiate("logic-plugin", "compare");
        nodeBuilder.setTitle("Compare");
        nodeBuilder.setDescription("Performs a comparison operation (==/!=/>/</>=/<=) on two inputs and returns a single boolean output");
      
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const state = Math.min(uiInputs?.state ?? 0, 4);
          const valA = anchorInputs.valA;
          const valB = anchorInputs.valB;
          switch (state) {
            case 0: return { res: valA  >  valB }
            case 1: return { res: valA  >= valB }
            case 2: return { res: valA  <  valB }
            case 3: return { res: valA  <= valB }
            case 4: return { res: valA === valB }
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "state",
            label: "State",
            defaultValue: 0,
            updateBackend: true,
        }, {
          options: {
            ">": 0,
            "≥": 1,
            "<": 2,
            "≤": 3,
            "=": 4,
          }
        });

        nodeBuilder.setUI(ui);
      
        nodeBuilder.addInput("Number", "valA", "A");
        nodeBuilder.addInput("Number", "valB", "B");
        nodeBuilder.addOutput("boolean", "res", "Result");
      },
    "ternary": (context) => {
        nodeBuilder = context.instantiate("logic-plugin","ternary");
        nodeBuilder.setTitle("Ternary Comp.");

        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const cond = anchorInputs.cond ?? false;
          const valT = anchorInputs.valT;
          const valF = anchorInputs.valF;
          return { "res" : cond ? valT : valF };
        });

      nodeBuilder.addInput("boolean","condition", "Condition");
      nodeBuilder.addInput("","valT", "Value True");
      nodeBuilder.addInput("","valF", "Value False");
      nodeBuilder.addOutput("","res", "Result");
    }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};