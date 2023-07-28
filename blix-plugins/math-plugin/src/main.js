const nodes ={
    "unary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output");

        // (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => { [key: AnchorId]: any }
        nodeBuilder.define((anchorInputs, uiInputs) => {
          switch (state) {
            case 0: return { res: Math.pow(num1, 2) };
            case 1: return { res: Math.sqrt(num1) };
            case 2: return { res: Math.abs(num1) };
            case 3: return { res: factorial(num1) };
            case 4: return { res: -num1 };
            case 5: return { res: Math.sin(num1) };
            case 6: return { res: Math.cos(num1) };
            case 7: return { res: Math.tan(num1) };
            default: return { res: "Invalid state" };
          }
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

        nodeBuilder.define((data) => {
          return {
            "res": data.input[0] + data.input[0],
          }[data.from];

          });
          
       nodeBuilder.addInput("Number", "num","Num");
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