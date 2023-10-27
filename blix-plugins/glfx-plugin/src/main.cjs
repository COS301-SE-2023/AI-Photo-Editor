// Use UI input if anchor not defined
function chooseInput(input, uiInput, inputKey) {
    if (input[inputKey] ?? false) {
        return input[inputKey];
    }
    return uiInput[inputKey];
}

function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function createGLFXNode(type, title, desc, params) {
    return (context) => {
        const nodeBuilder = context.instantiate("GLFX", type);
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
        // for (let param of params) {
        //     nodeBuilder.addInput("number", param.id, toTitleCase(param.id));
        // }
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
    "swirl": [
        "Swirl",
        "Add Swirl effect to the image",
        [
            { id: "x", min: 0, max: 500, step: 1.0 }, 
            { id: "y", min: 0, max: 500, step: 1.0 }, 
            { id: "radius", min: 0, max: 600, step: 1.0 }, 
            { id: "angle", min: -25, max: 25, step: 1.0 }
        ]
    ],
    "zoomBlur": [
        "Zoom Blur",
        "Blurs the image away from a certain point, which looks like radial motion blur.",
        [
            { id: "x", min: 0, max: 500, step: 1.0 }, 
            { id: "y", min: 0, max: 500, step: 1.0 }, 
            { id: "strength", min: 0, max: 1, step: 0.1 }
        ]
    ],
    "tiltShift": [
        "Tilt Shift",
        "Simulates the shallow depth of field normally encountered in close-up photography, which makes the scene seem much smaller than it actually is.",
        [
            { id: "x1", min: 0, max: 500, step: 1.0 }, 
            { id: "y1", min: 0, max: 500, step: 1.0 }, 
            { id: "x2", min: 0, max: 500, step: 1.0 }, 
            { id: "y2", min: 0, max: 500, step: 1.0 }, 
            { id: "blurRadius", min: 0, max: 50, step: 1.0 }, 
            { id: "gradientRadius", min: 0, max: 400, step: 1.0 }
        ]
    ],
    "bulgePinch": [
        "Bulge / Pinch",
        "Bulges or pinches the image in a circle.",
        [
            { id: "x", min: 0, max: 500, step: 1.0 }, 
            { id: "y", min: 0, max: 500, step: 1.0 }, 
            { id: "radius", min: 0, max: 600, step: 1.0 }, 
            { id: "strength", min: -1, max: 1, step: 0.1 }
        ]
    ],
    "ink": [ 
        "Ink",
        "Simulates outlining the image in ink by darkening edges stronger than a certain threshold.",
        [{ id: "strength", min: 0, max: 1, step: 0.01 }]
    ],
    "edgeWork": [ 
        "Edge Work",
        "Picks out different frequencies in the image by subtracting two copies of the image blurred with different radii.",
        [{ id: "radius", min: 0, max: 100, step: 0.1 }]
    ],
    "hexagonalPixelate": [
        "Hexagonal Pixelate",
        "Renders the image using a pattern of hexagonal tiles. Tile colors are nearest-neighbor sampled from the centers of the tiles.",
        [
            { id: "x", min: 0, max: 500, step: 1.0 }, 
            { id: "y", min: 0, max: 500, step: 1.0 }, 
            { id: "scale", min: 1, max: 100, step: 1.0 }, 
        ]
    ],

};

Object.keys(glfxNodes).forEach((key) => {
    glfxNodes[key] = createGLFXNode(key, ...glfxNodes[key]);
});

const nodes = {
    ...glfxNodes,
    "GLFXImage": (context) => {
        const nodeBuilder = context.instantiate("Input", "GLFXImage");
        nodeBuilder.setTitle("GLFX Image");
        nodeBuilder.setDescription("Takes a cache object as input and outputs a GLFX image");

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

function init(context) {

    const glfxTypeBuilder = context.createTypeclassBuilder("GLFX image");
    glfxTypeBuilder.setToConverters({
        "image": (value) => ({})
    });
    glfxTypeBuilder.setFromConverters({
        "image": (value) => ({})
    });

    glfxTypeBuilder.setDisplayConfigurator((data) => {
        return {
            displayType: "webview",
            props: {
                renderer: `${context.pluginId}/glfxRenderer`,
                media: null
            },
            contentProp: "media"
        };
    });

    // glfxTypeBuilder.setMediaHandler("glfxHandler"); // "./dist/glfxHandler/index.html" in package.json

    // glfxTypeBuilder.setType("GLFX", ['a'], "GLFX a")
    // glfxTypeBuilder.setType("Maybe", ['a'], "Just a | Nothing");
    // glfxTypeBuilder.setType("List", ['x'], "Empty | Cons x (List x)");
    // glfxTypeBuilder.setType("Either", ['a', 'b'], "Left a | Right b");

    // Define implicit flatmap
    // value: GLFX <({ [key: AnchorId]: any }, { [key: UIComponentId]: any })>
    // func: (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => GLFX<{ [key: AnchorId]: any }>

    // result: GLFX<{ [key: AnchorId]: any }>
    // glfxTypeBuilder.setBind((value, func) => {
    // });
}

module.exports = {
    nodes,
    commands,
    tiles,
    init
};