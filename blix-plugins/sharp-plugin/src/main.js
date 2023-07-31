const isProd = process.env.NODE_ENV === "production";
const sharp = require(isProd ? "../../../app.asar/node_modules/sharp" : "sharp")

const nodes = {
    "brightness": (context) => {
        nodeBuilder = context.instantiate("sharp-plugin", "brightness");
        nodeBuilder.setTitle("Brightness");
        nodeBuilder.setDescription("Adjusts the brighness of an image taking one image as input and returning one image as output");

        const ui = nodeBuilder.createUIBuilder();
        ui
            .addSlider(
                {
                    componentId: "brightness",
                    label: "Brightness",
                    defaultValue: 0,
                    updateBackend: true,
                },
                { min: 0, max: 10, set: 0.1 }
            );

        nodeBuilder.define(async (input, uiInput, from) => {
            if (input["value"]) {
                return { "res": await input["img"].modulate({ brightness: input["value"] }) }
            }
            else {
                return { "res": await input["img"].modulate({ brightness: uiInput["brightness"] }) }
            }
            //TODO: implement
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addInput("Number", "value", "Value");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "saturation": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "saturation");
        nodeBuilder.setTitle("Saturation");
        nodeBuilder.setDescription("Adjusts the saturation of an image taking one image as input and returning one image as output");

        const ui = nodeBuilder.createUIBuilder();
        ui
            .addSlider(
                {
                    componentId: "saturation",
                    label: "Slide Along",
                    defaultValue: 0,
                    updateBackend: true,
                },
                { min: 0, max: 10, set: 0.1 }
            );


        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": await input["img"].modulate({
                    saturation: uiInput["saturation"]
                }),
            }
            //TODO: implement
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "hue": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "hue");
        nodeBuilder.setTitle("Hue");
        nodeBuilder.setDescription("Adjusts the hue of an image taking one image as input and returning one image as output");
        const ui = nodeBuilder.createUIBuilder();
        ui
            .addSlider(
                {
                    componentId: "hue",
                    label: "Slide Along",
                    defaultValue: 0,
                    updateBackend: true,
                },
                { min: 0, max: 360, step: 5 }
            );

        nodeBuilder.define(async (input, uiInput, from) => {
            //TODO: implement
            return {
                "res": await input["img"].modulate({
                    hue: Math.round(uiInput["hue"])
                }),
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "rotate": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "rotate");
        nodeBuilder.setTitle("Rotate");
        nodeBuilder.setDescription("Rotates an image by an explicit angle taking one image as input and returning one image as output");
        const ui = nodeBuilder.createUIBuilder();
        ui
            .addSlider(
                {
                    componentId: "rotate",
                    label: "Slide Along",
                    defaultValue: 0,
                    updateBackend: true,
                },
                { min: 0, max: 360, step: 0.1 }
            );

        nodeBuilder.define(async (input, uiInput, from) => {
            //TODO: implement
            return {
                "res": await input["img"].rotate(uiInput["rotate"]),
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "sharpen": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "sharpen");
        nodeBuilder.setTitle("Sharpen");
        nodeBuilder.setDescription("Sharpens an image taking one image as input and returning one image as output");
        ui
            .addSlider(
                {
                    componentId: "sigma",
                    label: "Sigma",
                    defaultValue: 0,
                    updateBackend: true,
                },
                { min: 0, max: 10, step: 0.1 }
            );
        ui.addSlider(
            {
                componentId: "m1",
                label: "M1",
                defaultValue: 0,
                updateBackend: true,
            },
            { min: 0, max: 10, step: 0.1 }
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": await input["img"].sharpen({
                    sigma: uiInput["sigma"],
                    m1: uiInput["m1"]
                })
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "normalise": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "normalise");
        nodeBuilder.setTitle("Normalise");
        nodeBuilder.setDescription("Enhance image contrast by stretching its luminance to cover a full dynamic range taking one image as input and returning one image as output");

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": await input["img"].normalise()
            }
            //TODO: implement
        });

        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "toImage": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "toImage");
        nodeBuilder.setTitle("To Image");
        nodeBuilder.setDescription("Converts the sharp object to an image");

        nodeBuilder.define(async (input, uiInput, from) => {
            //TODO: implement
            const img = await input["img"].toBuffer();
            return { "res": "data:image/png;base64, " + img.toString('base64') };
        });

        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addOutput("Image", "res", "Result");
    },
    "toSharp": (context) => {
        const nodeBuilder = context.instantiate("sharp-plugin", "toSharp");
        nodeBuilder.setTitle("To Sharp");
        nodeBuilder.setDescription("Converts an image path to a sharp object");

        nodeBuilder.define(async (input, uiInput, from) => {
            //TODO: implement
            return { "res": await sharp(input["img"]) };
        });

        nodeBuilder.addInput("Image", "img", "Img");
        nodeBuilder.addOutput("Sharp", "res", "Result");
    },
    "inputSharpImage": (context) => {
        nodeBuilder = context.instantiate("input-plugin", "inputImage");
        nodeBuilder.setTitle("Input image");
        nodeBuilder.setDescription("Provides an image input and returns a single image output");

        nodeBuilder.define(async (input, uiInput, from) => {
            return { "res": await sharp(uiInput["imagePicker"]) };
        });

        ui = nodeBuilder.createUIBuilder();
        ui.addFilePicker({
            componentId: "imagePicker",
            label: "Pick an image",
            defaultValue: "",
            updateBackend: true,
        }, {});

        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("Sharp", "res", "Result");
    },

}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};