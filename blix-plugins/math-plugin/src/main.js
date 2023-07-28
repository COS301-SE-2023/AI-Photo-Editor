const nodes ={
    "unary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs) => {
          state = uiInputs?.state ?? 0;
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
          return { res: "Invalid state" };
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown("state", {
          "Square": 0,
          "Square Root": 1,
          "Absolute": 2,
          "Factorial": 3,
          "Negate": 4,
          "Sine": 5,
          "Cosine": 6,
          "Tangent": 7
        }, "Square");

        nodeBuilder.setUI(ui);

        // UI params are passed directly to the defined function
        // Optionally, you can specify to disable certain UI params when
        // an edge is connected to a specific anchor

        nodeBuilder.addInput("Number", "num","Num");
        nodeBuilder.addOutput("Number", "res","Result");
    },
    "binary": (context) => {
        const nodeBuilder = context.instantiate("math-plugin", "binary");
        nodeBuilder.setTitle("Binary");
        nodeBuilder.setDescription("Performs Binary math operations taking two number inputs and returning one number output");
      
        nodeBuilder.define((num1, num2, state) => {
          let result;
      
          switch (state) {
            case 0:
              // Addition
              result = num1 + num2;
              break;
      
            case 1:
              // Subtraction
              result = num1 - num2;
              break;
      
            case 2:
              // Multiplication
              result = num1 * num2;
              break;
      
            case 3:
              // Division
              result = num1 / num2;
              break;
      
            case 4:
              // Exponentiation
              result = Math.pow(num1, num2);
              break;
      
            case 5:
              // Modulo
              result = num1 % num2;
              break;
      
            case 6:
              // Maximum
              result = Math.max(num1, num2);
              break;
      
            case 7:
              // Minimum
              result = Math.min(num1, num2);
              break;
      
            default:
              result = "Invalid state";
          }
      
          return result;
        });
      
        nodeBuilder.addInput("Number", "num1", "Num1");
        nodeBuilder.addInput("Number", "num2", "Num2");
        nodeBuilder.addOutput("Number", "res1", "Result");
      },

      // Testing nodes
    "add": (context) => {
        nodeBuilder = context.instantiate("math-plugin","add");
        nodeBuilder.setTitle("Add");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output");

        nodeBuilder.define((input, uiInput, from) => {
          console.log(input);
          return {
            "res": input["num1"] + input["num2"],
          };

          });
          
       nodeBuilder.addInput("Number", "num1","Num");
       nodeBuilder.addInput("Number", "num2","Num");
       nodeBuilder.addOutput("Number", "res","Result");
    },
    // TO BE DEVELOPED   
    // "ternary": (context) => {
    //     nodeBuilder = context.instantiate("math-plugin","add");
    //     nodeBuilder.setTitle("Addition");
    //     nodeBuilder.define((num1 ,num2) => {
    //         return num1+num2;
    //     });

    //    nodeBuilder.addInput("string","In1");
    //    nodeBuilder.addInput("string","In2");

    //    nodeBuilder.addOutput("string","Out1");
    // }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};