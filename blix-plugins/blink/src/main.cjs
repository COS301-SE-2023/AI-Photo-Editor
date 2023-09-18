const crypto = require("crypto");

function getUUID() {
    return crypto.randomBytes(16).toString("base64url");
}

function colorHexToAlpha(str) {
    if (str.length <= 7) return 1.0;
    return parseInt("0x" + str.slice(7, 9))/255.0;
}
function colorHexToNumber(str) {
    return parseInt(str.slice(0, 7).replace("#", "0x"));
}

function chooseInput(input, uiInput, inputKey) {
    if (input[inputKey] != null) {
        return input[inputKey];
    }
    return inputKey.includes("color") ? colorHexToNumber(uiInput[inputKey]) : uiInput[inputKey];
}

function toTitleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function addTransformInput(ui, props = ["position", "rotation", "scale"]) {
    const propInputs = [
        ...(props.includes("position") ? ["position X", "position Y"] : []),
        ...(props.includes("rotation") ? ["rotation"] : []),
        ...(props.includes("scale")    ? ["scale X", "scale Y"] : [])
    ];
    for (let numInp of propInputs) {
    // for (let numInp of ["position X", "position Y", "rotation", "scale X", "scale Y"]) {
        ui.addNumberInput(
            {
                componentId: numInp.replace(" ", ""),
                label: numInp[0].toUpperCase() + numInp.slice(1),
                defaultValue: (numInp.includes("scale") ? 1 : 0),
                triggerUpdate: true,
            },
            numInp.includes("scale") ? { step: 0.025 } :
            numInp === "rotation" ? { step: 0.2 } :
            { step: 1 }
        );
    }
    return (uiInput) => ({
        ...(props.includes("position") ? { position: { x: uiInput?.positionX, y: uiInput?.positionY } } : {}),
        ...(props.includes("rotation") ? { rotation: uiInput?.rotation } : {}),
        ...(props.includes("scale")    ? { scale:    { x: uiInput?.scaleX, y: uiInput?.scaleY }, } : {})
    });
}

function addState(ui) {
    ui.addBuffer({
            componentId: "state",
            label: "State Buffer",
            defaultValue: { id: null },
            triggerUpdate: true,
        }, {}
    );
}

function addTweakability(ui) {
    ui.addTweakDial("tweaks", {});
    ui.addDiffDial("diffs", {});
}

function createBlinkNode(type, title, desc, params) {
    return (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, type);
        nodeBuilder.setTitle(title);
        nodeBuilder.setDescription(desc);

        const ui = nodeBuilder.createUIBuilder();
        for (let param of params) {
            if(param.id.includes("color") || param.id.includes("Color")) {
                ui.addColorPicker({
                    componentId: param.id,
                    label: toTitleCase(param.id),
                    defaultValue: "#000000",
                    triggerUpdate: true,
                }, {})
                
            }
            else{
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
        }
        nodeBuilder.define(async (input, uiInput, from) => {

            const canvas = input["clump"];

            if (!canvas.content.filters) canvas.content.filters = [];
            canvas.content.filters.push({
                class: "filter",
                type: type,
                params: params.map((param) => chooseInput(input, uiInput, param.id)),
            });

            return { "res": canvas };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump", "Clump");
        // for (let param of params) {
        //     nodeBuilder.addInput("number", type, toTitleCase(param.id));
        // }
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    };
}

const blinkNodes = {
    "blur": [ 
        "Blur",
        "Applies a blur to the image",
        [{ id: "blur", min: 0, max: 100, step: 0.1 }, { id: "quality", min: 1, max: 10, step: 0.01 }]
    ],
    "noise": [ 
        "Noise",
        "Applies a noise filter to the image",
        [{ id: "noise", min: 0, max: 1, step: 0.01 }, { id: "seed", min: 0.01, max: 0.99, step: 0.01 }]
    ],
    "bloom": [ 
        "Bloom",
        "Applies a Guassian blur to the image",
        [{ id: "strength", min: 0, max: 20, step: 0.1 }]
    ],
    "grayscale": [ 
        "Gray Scale",
        "Applies a grayscale filter to the image",
        []
    ],
    "bevel": [ 
        "Bevel",
        "Bevel Filter",
        [
            { id: "rotation", min: 0, max: 360, step: 1.0 },
            { id: "thickness", min: 0, max: 100, step: 0.1 },
            { id: "lightColor" },
            { id: "lightAlpha", min: 0, max: 1, step: 0.01 },
            { id: "shadowColor" },
            { id: "shadowAlpha", min: 0, max: 1, step: 0.01 },
        ]
    ],
    "outline": [ 
        "Outline",
        "Applies an outline filter to the image",
        [
            { id: "thickness", min: 0, max: 100, step: 0.1 }, 
            { id: "color" },
            { id: "alpha", min: 0, max: 1, step: 0.01 },
        ]
    ],
    "dot": [
        "Dot",
        "This filter applies a dotscreen effect making display objects appear to be made out of halftone dots like an old printer",
        [{ id: "scale", min: 0.3, max: 1, step: 0.01 }, { id: "angle", min: 0, max: 5, step: 0.01 }]
    ],
    "crt": [
        "CRT",
        "Applies a CRT effect to the image",
        [
            { id: "curvature", min: 0, max: 10, step: 0.01 }, 
            { id: "lineWidth", min: 0, max: 5, step: 0.01 },
            { id: "lineContrast", min: 0, max: 1, step: 0.01 },
            { id: "noise", min: 0, max: 1, step: 0.01 },
            { id: "noiseSize", min: 1, max: 10, step: 0.01 },
            { id: "vignetting", min: 0, max: 1, step: 0.01 },
            { id: "vignettingAlpha", min: 0, max: 1, step: 0.01 },
            { id: "vignettingBlur", min: 0, max: 1, step: 0.01 },
            { id: "seed", min: 0, max: 1, step: 0.01 },
        ]
    ],
};

Object.keys(blinkNodes).forEach((key) => {
    blinkNodes[key] = createBlinkNode(key, ...blinkNodes[key]);
});

//========== NODES ==========//
const nodes = {
    ...blinkNodes,

    "inputImage": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "inputImage");
        nodeBuilder.setTitle("Blink Image");
        nodeBuilder.setDescription("Input a Blink Sprite Image");

        const ui = nodeBuilder.createUIBuilder();
        ui.addFilePicker({
            componentId: "imagePicker",
            label: "Pick an image",
            defaultValue: "",
            triggerUpdate: true,
        }, {});
        // ui.addCachePicker({
        //     componentId: "cachePicker",
        //     label: "Pick an cache item",
        //     defaultValue: "",
        //     triggerUpdate: true,
        // }, {});
        addTransformInput(ui);
        addState(ui);
        addTweakability(ui);

        nodeBuilder.setUIInitializer((x) => {
            return {
                state: {
                    id: getUUID(),
                }
            };
        });

        nodeBuilder.define(async (input, uiInput, from) => {
            let src = uiInput["imagePicker"].split("/");
            src = src.splice(-2);
            src = src.join("/");

            const canvas = {
                assets: {
                    [uiInput["state"]["id"]]: {
                        class: "asset",
                        type: "image",
                        data: uiInput["imagePicker"].split("/").splice(-2).join("/"),
                        // data: uiInput["cachePicker"],
                    }
                },
                content: {
                    class: "clump",
                    nodeUUID: uiInput["tweaks"].nodeUUID,
                    changes: uiInput["diffs"]?.uiInputs ?? [],
                    transform: {
                        position: { x: uiInput["positionX"], y: uiInput["positionY"] },
                        rotation: uiInput["rotation"],
                        scale: { x: uiInput["scaleX"], y: uiInput["scaleY"] },
                    },
                    elements: [
                        {
                            class: "atom",
                            type: "image",
                            assetId: uiInput["state"]["id"],
                        }
                    ]
                }
            }

            return { res: canvas };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink matrix", "transform", "Transform");
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    },
    "inputShape": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "inputShape");
        nodeBuilder.setTitle("Blink Shape");
        nodeBuilder.setDescription("Input a Blink Shape");

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "shape",
            label: "Shape",
            defaultValue: "rectangle",
            triggerUpdate: true,
        }, {
          options: {
            "Rectangle": "rectangle",
            "Ellipse": "ellipse",
            "Triangle": "triangle",
          }
        })
        for (let numInp of ["width", "height"]) {
            ui.addNumberInput(
                {
                    componentId: numInp.replace(" ", ""),
                    label: numInp[0].toUpperCase() + numInp.slice(1),
                    defaultValue: 100,
                    triggerUpdate: true,
                },
                {}
            );
        }
        const getTransform = addTransformInput(ui, ["position", "rotation"]);

        ui.addColorPicker({
            componentId: "fill",
            label: "Fill",
            defaultValue: "#000000",
            triggerUpdate: true,
        }, {})
        ui.addColorPicker({
            componentId: "stroke",
            label: "Stroke",
            defaultValue: "#00000000",
            triggerUpdate: true,
        }, {})

        addTweakability(ui);

        nodeBuilder.define(async (input, uiInput, from) => {
            const canvas = {
                assets: {
                    "1": {
                      class: "asset",
                      type: "image",
                      data: "media/bird.png",
                    },
                },
                content: {
                    class: "clump",
                    nodeUUID: uiInput["tweaks"].nodeUUID,
                    changes: uiInput["diffs"]?.uiInputs ?? [],
                    transform: getTransform(uiInput),
                    elements: [
                        {
                            class: "atom",
                            type: "shape",
                            shape: uiInput["shape"],
                            bounds: { w: uiInput["width"], h: uiInput["height"] },

                            fill: colorHexToNumber(uiInput["fill"]),
                            fillAlpha: colorHexToAlpha(uiInput["fill"]),
                            stroke: colorHexToNumber(uiInput["stroke"]),
                            strokeAlpha: colorHexToAlpha(uiInput["stroke"]),
                            strokeWidth: 1,
                        }
                    ]
                }
            }

            return { res: canvas };
        });

        nodeBuilder.setUI(ui);

        nodeBuilder.addInput("Blink matrix", "transform", "Transform");
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    },
    "matrix": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "matrix");
        nodeBuilder.setTitle("Matrix");
        nodeBuilder.setDescription("Construct a Blink matrix");

        const ui = nodeBuilder.createUIBuilder();
        ui.addSlider(
            {
                componentId: "number",
                label: "Input number",
                defaultValue: 0,
                triggerUpdate: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": {}
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("vec2", "translation", "Translation");
        nodeBuilder.addInput("number", "rotation", "Rotation");
        nodeBuilder.addInput("vec2", "scale", "Scale");
        nodeBuilder.addOutput("Blink matrix", "res", "Result");
    },
    "layer": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "layer");
        nodeBuilder.setTitle("Layer");
        nodeBuilder.setDescription("Layer two or more Blink clumps");

        const ui = nodeBuilder.createUIBuilder();
        const getTransform = addTransformInput(ui);
        ui.addSlider(
            {
                componentId: "opacity",
                label: "Opacity",
                defaultValue: 100,
                triggerUpdate: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );
        addTweakability(ui);

        nodeBuilder.define(async (input, uiInput, from) => {
            // Apply filter to outermost clump
            const clumps = [1, 2, 3, 4, 5].map(n => input[`clump${n}`]).filter(c => c != null);

            // Construct assets union
            const assets = {};
            clumps.forEach(c => {
                Object.keys(c.assets).forEach(k => {
                    assets[k] = c.assets[k];
                });
            });

            // Construct parent clump
            const parent = {
                class: "clump",
                nodeUUID: uiInput["tweaks"].nodeUUID,
                changes: uiInput["diffs"]?.uiInputs ?? [],
                transform: getTransform(uiInput),
                opacity: uiInput["opacity"],
                elements: clumps.map(c => c.content)
            }

            return { "res": { assets, content: parent } };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump1", "Clump 1");
        nodeBuilder.addInput("Blink clump", "clump2", "Clump 2");
        nodeBuilder.addInput("Blink clump", "clump3", "Clump 3");
        nodeBuilder.addInput("Blink clump", "clump4", "Clump 4");
        nodeBuilder.addInput("Blink clump", "clump5", "Clump 5");
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    },
    "filter": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "filter");
        nodeBuilder.setTitle("Filter");
        nodeBuilder.setDescription("Construct a Blink matrix");

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "filter",
            label: "Filter",
            defaultValue: "blur",
            triggerUpdate: true,
        }, {
          options: {
            "Blur":         "blur",
            "Noise":        "noise",
            "Bloom":        "bloom",
            "Grayscale":    "grayscale",
            "Bevel":        "bevel",
            "Outline":      "outline",
            "Dot":          "dot",
            "Crt":          "crt",
            "Emboss":       "emboss",
            "Bulge":        "bulge",
            "Glitch":       "glitch",
            "Zoomblur":     "zoomblur",
            "Twist":        "twist", 
          }
        })
        .addSlider(
            {
                componentId: "strength",
                label: "Strength",
                defaultValue: 10,
                triggerUpdate: true,
            },
            { min: 0, max: 100, set: 0.1 }
        )
        .addSlider(
            {
                componentId: "amount",
                label: "Amount",
                defaultValue: 10,
                triggerUpdate: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            // Apply filter to outermost clump
            const canvas = input["clump"];

            if (!canvas.content.filters) canvas.content.filters = [];
            canvas.content.filters.push({
                class: "filter",
                type: uiInput["filter"],
                params: [uiInput["strength"], uiInput["amount"]],
            });

            return { "res": canvas };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump", "Clump");
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    }
};
const commands = {};
const tiles = {};

function init(context) {

    const glfxTypeBuilder = context.createTypeclassBuilder("Blink clump");
    // glfxTypeBuilder.setToConverters({
    //     "image": (value) => ({})
    // });
    // glfxTypeBuilder.setFromConverters({
    //     "image": (value) => ({})
    // });

    glfxTypeBuilder.setDisplayConfigurator((data) => {
        return {
            displayType: "webview",
            props: {
                renderer: `${context.pluginId}/blinkRenderer`,
                media: null
            },
            contentProp: "media"
        };
    });
}

module.exports = {
    nodes,
    commands,
    tiles,
    init
};