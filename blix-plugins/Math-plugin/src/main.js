// Here we define node UIs and callbacks
const nodes ={
    "unary": (context) => {
        nodeBuilder = context.instantiate("math-plugin","unary");
        nodeBuilder.setTitle("Unary");
        nodeBuilder.setDescription("Unary math operations");

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
            
            // Return the result
            return result;
          });
          
       nodeBuilder.addInput("string","In1");
       nodeBuilder.addOutput("string","Out1");
    },
    "binary": (context) => {
        const nodeBuilder = context.instantiate("math-plugin", "binary");
        nodeBuilder.setTitle("Binary");
        nodeBuilder.setDescription("Binary math operations");
      
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
      
          // Return the result
          return result;
        });
      
        nodeBuilder.addInput("number", "Num1");
        nodeBuilder.addInput("number", "Num2");
        nodeBuilder.addOutput("number", "Result");
      }
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



// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {}

// Here we define custom tiles for the UI
const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};