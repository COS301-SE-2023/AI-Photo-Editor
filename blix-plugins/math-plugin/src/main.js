const nodes ={
    "unary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output");

        nodeBuilder.define((num1, state) => {
            let result;
            
            switch (state) {
              case 0:
                // squared
                result = Math.pow(num1, 2);
                break;
                
              case 1:
                // square root
                result = Math.sqrt(num1);
                break;
              case 2:
                // absolute value
                result = Math.abs(num1);
                break;
              case 3:
                // factorial
                  result = factorial(num1);
                  break;
              case 4:
                // negative
                result = -num1;
                break;
              case 5:
                // sine
                  result = Math.sin(num1);
                  break;
                  
              case 6:
                // cosine
                result = Math.cos(num1);
                break;
                
              case 7:
                // tangent
                result = Math.tan(num1);
                break;

               default:
                result = "Invalid state";
            }
            
            return result;
          });
          
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

    //   // Testing nodes
    // "add": (context) => {
    //     nodeBuilder = context.instantiate("math-plugin","add");
    //     nodeBuilder.setTitle("Add");
    //     nodeBuilder.setDescription("Performs Unary math operations taking one number input and returning one number output");

    //     nodeBuilder.define((data) => {
    //       return {
    //         "res": data.input[0] + data.input[1],
    //       }[data.from];

    //       });
          
    //    nodeBuilder.addInput("Number", "num1","Num");
    //    nodeBuilder.addInput("Number", "num2","Num")
    //    nodeBuilder.addOutput("Number", "res","Result");
    // },
    // Testing ternary
    "ternary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","ternary");
        nodeBuilder.setTitle("Ternary");
        nodeBuilder.define((data) => {
            return { "res" : data.input[0] + data.input[1] + data.input[2] }[data.from];
        });

      nodeBuilder.addInput("Number","num1", "Num");
      nodeBuilder.addInput("Number","num2", "Num");
      nodeBuilder.addInput("Number","num3", "Num");
      nodeBuilder.addOutput("Number","res", "Num");
    }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};