const nodes ={
    "unary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output,such as root, negate or square");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const state = Math.min(uiInputs?.state ?? 0, 7);
          switch (state) {
            case 0: return { res: Math.pow(anchorInputs.num, 2) };
            case 1: return { res: Math.sqrt(anchorInputs.num)   };
            case 2: return { res: Math.abs(anchorInputs.num)    };
            case 3: return { res: factorial(anchorInputs.num)   };
            case 4: return { res: -anchorInputs.num             };
            case 5: return { res: Math.sin(anchorInputs.num)    };
            case 6: return { res: Math.cos(anchorInputs.num)    };
            case 7: return { res: Math.tan(anchorInputs.num)    };
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
            "Square": 0,
            "Square Root": 1,
            "Absolute": 2,
            "Factorial": 3,
            "Negate": 4,
            "Sine": 5,
            "Cosine": 6,
            "Tangent": 7
          }
        });

        nodeBuilder.setUI(ui);

        nodeBuilder.addInput("Number", "num","Num");
        nodeBuilder.addOutput("Number", "res","Result");
    },
    "binary": (context) => {
        const nodeBuilder = context.instantiate("math-plugin", "binary");
        nodeBuilder.setTitle("Binary");
        nodeBuilder.setDescription("Performs Binary math operations taking two number inputs and returning one number output");
      
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const state = Math.min(uiInputs?.state ?? 0, 7);
          const num1 = anchorInputs.num1 ?? 0;
          const num2 = anchorInputs.num2 ?? 0;
          switch (state) {
            case 0: return { res: num1 + num2           }
            case 1: return { res: num1 - num2           }
            case 2: return { res: num1 * num2           }
            case 3: return { res: num1 / num2           }
            case 4: return { res: Math.pow(num1, num2)  }
            case 5: return { res: num1 % num2           }
            case 6: return { res: Math.max(num1, num2)  }
            case 7: return { res: Math.min(num1, num2)  }
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
            "Add": 0,
            "Subtract": 1,
            "Multiply": 2,
            "Divide": 3,
            "Power": 4,
            "Modulo": 5,
            "Max": 6,
            "Min": 7
          }
        });

        nodeBuilder.setUI(ui);
      
        nodeBuilder.addInput("Number", "num1", "Num1");
        nodeBuilder.addInput("Number", "num2", "Num2");
        nodeBuilder.addOutput("Number", "res", "Result");
      },
    // "ternary": (context) => {
    //     nodeBuilder = context.instantiate("math-plugin","ternary");
    //     nodeBuilder.setTitle("Ternary");
    //     nodeBuilder.define((data) => {
    //         return { "res" : data.input[0] + data.input[1] + data.input[2] }[data.from];
    //     });

    //   nodeBuilder.addInput("Number","num1", "Num");
    //   nodeBuilder.addInput("Number","num2", "Num");
    //   nodeBuilder.addInput("Number","num3", "Num");
    //   nodeBuilder.addOutput("Number","res", "Num");
    // }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};