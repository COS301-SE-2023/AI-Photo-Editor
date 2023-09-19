// Use UI input if anchor not defined
function chooseInput(input, uiInput, inputKey) {
    if (input[inputKey]) {
        return input[inputKey];
    }
    return uiInput[inputKey];
}

function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function createGLFXNode(type, title, desc, params) {
    return (context) => {
        const nodeBuilder = context.instantiate("glfx-plugin", type);
        nodeBuilder.setTitle(title);
        nodeBuilder.setDescription(desc);

        const ui = nodeBuilder.createUIBuilder();
        for (let param of params) {
            ui.addSlider(
                {
                    componentId: param.id,
                    label: toTitleCase(param.id),
                    defaultValue: 0,
                    triggerUpdate: true,
                },
                { min: param.min ?? -1, max: param.max ?? 1, step: param.step ?? 0.05 }
            );
        }

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": {
                    src: input["img"]?.src,
                    ops: [
                        ...(input["img"]?.ops || []),
                        {
                            type,
                            args: params.map((param) => chooseInput(input, uiInput, param.id))
                        }
                    ]
                }
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("GLFX image", "img", "GLFX image");
        for (let param of params) {
            nodeBuilder.addInput("number", type, toTitleCase(param.id));
        }
        nodeBuilder.addOutput("GLFX image", "res", "Result");
    };
}

const glfxNodes = {
    "brightnessContrast": [ 
        "Brightness/Contrast",
        "Adjust the brightness and contrast of the image",
        [{ id: "brightness" }, { id: "contrast" }]
    ],
    "hueSaturation": [ 
        "Hue / Saturation",
        "Adjust the hue and saturation of the image",
        [{ id: "hue" }, { id: "saturation" }]
    ],
    "noise": [ 
        "Noise",
        "Add black and white noise to the image",
        [{ id: "amount", min: 0, max: 1, step: 0.01 }]
    ],
    "denoise": [ 
        "Denoise",
        "Smooth over grainy noise in dark images",
        [{ id: "exponent", min: 0, max: 50, step: 0.1 }]
    ],
    "sepia": [ 
        "Sepia",
        "Add a reddish-brown monochrome tint to the image",
        [{ id: "amount", min: 0, max: 1, step: 0.01 }]
    ],
    "unsharpMask": [ 
        "Unsharp Mask",
        "Image sharpening that amplifies high-frequency detail in the image",
        [{ id: "radius", min: 0, max: 200, step: 1 }, { id: "strength", min: 0, max: 5, step: 0.05 }]
    ],
    "vibrance": [
        "Vibrance",
        "Adjust saturation of desaturated colors, leaving saturated colors unmodified",
        [{ id: "amount" }]
    ],
    "vignette": [
        "Vignette",
        "Add a vignette effect to the image",
        [{ id: "size", min: 0, max: 1, step: 0.01 }, { id: "amount", min: 0, max: 1, step: 0.01 }]
    ],
};

Object.keys(glfxNodes).forEach((key) => {
    glfxNodes[key] = createGLFXNode(key, ...glfxNodes[key]);
});

const nodes = {
    ...glfxNodes,

    "inputGLFXImage": (context) => {
        const nodeBuilder = context.instantiate("input-plugin", "inputGLFXImage");
        nodeBuilder.setTitle("Input GLFX image");
        nodeBuilder.setDescription("Provides an image input and returns a single image output");

        nodeBuilder.define(async (input, uiInput, from) => {
            return { "res": { src: uiInput["imagePicker"] } };
        });

        const ui = nodeBuilder.createUIBuilder();
        ui.addFilePicker({
            componentId: "imagePicker",
            label: "Pick an image",
            defaultValue: "",
            triggerUpdate: true,
        }, {});
        // ui.addCachePicker({
        //     componentId: "cacheid",
        //     label: "Pick an image",
        //     defaultValue: "",
        //     triggerUpdate: true,
        // }, {})

        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("GLFX image", "res", "Result");
    },
    "inputGLFXCache": (context) => {
        const nodeBuilder = context.instantiate("input-plugin", "inputGLFXCache");
        nodeBuilder.setTitle("Input GLFX cache");
        nodeBuilder.setDescription("Provides an cache input and returns a single image output");

        nodeBuilder.define(async (input, uiInput, from) => {
            return { "res": { src: uiInput["cacheid"] } };
        });

        const ui = nodeBuilder.createUIBuilder();
        // ui.addFilePicker({
        //     componentId: "imagePicker",
        //     label: "Pick an image",
        //     defaultValue: "",
        //     triggerUpdate: true,
        // }, {});
        ui.addCachePicker({
            componentId: "cacheid",
            label: "Pick an image",
            defaultValue: "",
            triggerUpdate: true,
        }, {})

        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("GLFX image", "res", "Result");
    },
}

const commands = {}
const tiles = {}

const types = {}

module.exports = {
    nodes,
    commands,
    tiles
};