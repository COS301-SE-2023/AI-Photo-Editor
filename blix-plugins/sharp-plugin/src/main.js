const sharp = require('sharp');

const nodes ={
    "brightness": (context) => {
        nodeBuilder = context.instantiate("sharp-plugin","brightness");
        nodeBuilder.setTitle("Brightness");
        nodeBuilder.setDescription("Adjusts the brighness of an image taking one image as input and returning one image as output");

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": await input["img"].modulate({
                    brightness: 2
                }),
            }
            //TODO: implement
          });
          
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
    },
    "saturation": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "saturation");
        nodeBuilder.setTitle("Saturation");
        nodeBuilder.setDescription("Adjusts the saturation of an image taking one image as input and returning one image as output");
      
        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": await input["img"].modulate({
                    saturation: 0.5
                }),
            }
            //TODO: implement
        });
      
       nodeBuilder.addInput("Sharp", "img","Img");
       nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "hue": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "hue");
        nodeBuilder.setTitle("Hue");
        nodeBuilder.setDescription("Adjusts the hue of an image taking one image as input and returning one image as output");
      
        nodeBuilder.define( async (input, uiInput, from) => {
            //TODO: implement
            return {
                "res": await input["img"].modulate({
                    hue: 90
                }),
            }
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "rotate": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "rotate");
        nodeBuilder.setTitle("Rotate");
        nodeBuilder.setDescription("Rotates an image by an explicit angle taking one image as input and returning one image as output");
      
        nodeBuilder.define((input, uiInput, from) => {
            //TODO: implement
            return {
                "res": input["img"].rotate(90),
            }
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Sharp", "res","Result");
      },
    "sharpen": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "sharpen");
        nodeBuilder.setTitle("sharpen");
        nodeBuilder.setDescription("Sharpens an image taking one image as input and returning one image as output");
      
        nodeBuilder.define((input, uiInput, from) => {
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
      },
    "toImage": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "toImage");
        nodeBuilder.setTitle("To Image");
        nodeBuilder.setDescription("Converts the sharp object to an image");
      
        nodeBuilder.define(async (input, uiInput, from ) => {
            //TODO: implement
            const img = await input["img"].toBuffer();
            return {"res": "data:image/png;base64, " + img.toString('base64')};
        });
      
        nodeBuilder.addInput("Sharp", "img","Img");
        nodeBuilder.addOutput("Image", "res","Result");
      },
    "toSharp": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "toSharp");
        nodeBuilder.setTitle("To Sharp");
        nodeBuilder.setDescription("Converts an image path to a sharp object");
      
        nodeBuilder.define(async (input, uiInput, from ) => {
            //TODO: implement
            return {"res": sharp(input["img"])};
        });
      
        nodeBuilder.addInput("Image", "img","Img");
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