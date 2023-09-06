const nodes = {
    "unary": (context) => {
        const nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output,such as root, negate or square");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
          const operator = uiInputs?.operator || "square";
          switch (operator) {
            case "square": return { res: Math.pow(anchorInputs.num, 2)     };
            case "square_root": return { res: Math.sqrt(anchorInputs.num)  };
            case "absolute": return { res: Math.abs(anchorInputs.num)      };
            case "factorial": return { res: factorial(anchorInputs.num)    };
            case "negate": return { res: -anchorInputs.num                 };
            case "sine": return { res: Math.sin(anchorInputs.num)          };
            case "cosine": return { res: Math.cos(anchorInputs.num)        };
            case "tangent": return { res: Math.tan(anchorInputs.num)       };
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "operation",
            label: "Operation",
            defaultValue: "square",
            updateBackend: true,
        }, {
          options: {
            "Square": "square",
            "Square Root": "square_root",
            "Absolute": "absolute",
            "Factorial": "factorial",
            "Negate": "negate",
            "Sine": "sine",
            "Cosine": "cosine",
            "Tangent": "tangent"
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
          const operator = uiInputs?.operator || "add";
          const num1 = anchorInputs.num1 ?? 0;
          const num2 = anchorInputs.num2 ?? 0;
          switch (operator) {
            case "add": return { res: num1 + num2             }
            case "subtract": return { res: num1 - num2        }
            case "multiply": return { res: num1 * num2        }
            case "divide": return { res: num1 / num2          }
            case "power": return { res: Math.pow(num1, num2)  }
            case "modulo": return { res: num1 % num2          }
            case "max": return { res: Math.max(num1, num2)    }
            case "min": return { res: Math.min(num1, num2)    }
          }
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "operator",
            label: "Operator",
            defaultValue: "add",
            updateBackend: true,
        }, {
          options: {
            "Add": "add",
            "Subtract": "subtract",
            "Multiply": "multiply",
            "Divide": "divide",
            "Power": "power",
            "Modulo": "modulo",
            "Max": "max",
            "Min": "min"
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


const tiles = {
    "test": (context) => {

        tileBuilder = context.instantiate("math-plugin", "Math Tile");
        tileBuilder.setTitle("Math Tile");
        tileBuilder.setDescription("");
        tileBuilder.addIcon("faCode");


        tile1 = tileBuilder.createUIBuilder();
        tile1.addSidebar("right");
        tile1.sidebar.addButton(
          {
            componentId: "export",
            label: "Export",
            defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
            updatesBackend: false,
          },
          {}
        );

        tile1.sidebar.addButton(
          {
            componentId: "test",
            label: "Test",
            defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
            updatesBackend: false,
          },
          {}
        );
        tile1.sidebar.addButton(
          {
            componentId: "test2",
            label: "Stop",
            defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
            updatesBackend: false,
          },
          {}
        );

        tile2 = tileBuilder.createUIBuilder();
        tile2.addSidebar("left");
        tile2.addStatusbar("top");
        tile2.sidebar.addButton(
          {
            componentId: "test1",
            label: "Test",
            defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
            updatesBackend: false,
          },
          {}
        );

        tile3 = tileBuilder.createUIBuilder();
        tile3.addStatusbar("bottom");
        tile3.statusbar.addButton(
          {
            componentId: "test",
            label: "Test",
            defaultValue: "blix.graphs.export", // SUGGESTION: Use the default value to indicate the command to run?
            updatesBackend: false,
          },
          {}
        )

        tile2.addLayout(tile3);
        tile1.addLayout(tile2);


        tileBuilder.setUI(tile1);
    },
}

module.exports = {
    nodes,
    commands,
    tiles
};