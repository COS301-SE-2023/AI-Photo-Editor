const nodes ={
    "brightness": (context) => {
        nodeBuilder = context.instantiate("sharp-plugin","brightness");
        nodeBuilder.setTitle("Brightness");
        nodeBuilder.setDescription("Adjusts the brighness of an image taking one image as input and returning one image as output");

        nodeBuilder.define(() => {
            //TODO: implement
          });
          
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
    },
    "saturation": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "saturation");
        nodeBuilder.setTitle("Saturation");
        nodeBuilder.setDescription("Adjusts the saturation of an image taking one image as input and returning one image as output");
      
        nodeBuilder.define(() => {
            //TODO: implement
        });
      
       nodeBuilder.addInput("Sharp", "img","Img");
       nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "hue": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "hue");
        nodeBuilder.setTitle("Hue");
        nodeBuilder.setDescription("Adjusts the hue of an image taking one image as input and returning one image as output");
      
        nodeBuilder.define(() => {
            //TODO: implement
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "rotate": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "rotate");
        nodeBuilder.setTitle("Rotate");
        nodeBuilder.setDescription("Rotates an image by an explicit angle taking one image as input and returning one image as output");
      
        nodeBuilder.define(() => {
            //TODO: implement
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "sharpen": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "sharpen");
        nodeBuilder.setTitle("sharpen");
        nodeBuilder.setDescription("Sharpens an image taking one image as input and returning one image as output");
      
        nodeBuilder.define(() => {
            //TODO: implement
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "normalise": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "normalise");
        nodeBuilder.setTitle("Normalise");
        nodeBuilder.setDescription("Enhance image contrast by stretching its luminance to cover a full dynamic range taking one image as input and returning one image as output");
      
        nodeBuilder.define(() => {
            //TODO: implement
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};