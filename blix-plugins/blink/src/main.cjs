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

function addTransformInput(ui, props = ["position", "rotation", "scale", "origin"]) {
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
    if (props.includes("origin")) {
        ui.addOriginPicker(
            {
                componentId: "origin",
                label: "",
                defaultValue: "mm",
                triggerUpdate: true,
            },
            {}
        );
    }
    return (uiInput) => ({
        ...(props.includes("position") ? { position: { x: uiInput?.positionX, y: uiInput?.positionY } } : {}),
        ...(props.includes("rotation") ? { rotation: uiInput?.rotation } : {}),
        ...(props.includes("scale")    ? { scale:    { x: uiInput?.scaleX, y: uiInput?.scaleY }, } : {}),
        ...(props.includes("origin")   ? { origin:   uiInput?.origin } : {}),
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
    // ui.addDiffDial("diffs", {});
}

function createBlinkNode(type, title, desc, params) {
    return (context) => {
        const nodeBuilder = context.instantiate("Blink/Filters", type);
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
            { id: "curvature", min: 0, max: 100, step: 0.1 }, 
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
    "emboss": [
        "Emboss",
        "An RGB Split Filter.",
        [{ id: "strength", min: 0, max: 20, step: 0.1 }]
    ],
    "bulge": [ 
        "Bulge / Pinch",
        "Bulges or pinches the image in a circle.",
        [
            { id: "radius", min: 0, max: 1000, step: 1.0 }, 
            { id: "strength", min: -1, max: 1, step: 0.01 },
            { id: "center.x", min: 0, max: 1, step: 0.01 },
            { id: "center.y", min: 0, max: 1, step: 0.01 },
        ]
    ],
    "zoomblur": [ 
        "ZoomBlur",
        "The ZoomFilter applies a Zoom blur to an object.",
        [
            { id: "strength", min: 0, max: 0.5, step: 0.01 }, 
            { id: "innerRadius", min: 0, max: 1000, step: 1.0 },
            { id: "center.x", min: 0, max: 2000, step: 1.0 },
            { id: "center.y", min: 0, max: 2000, step: 1.0 },
        ]
    ],
    "brightnessContrast": [
        "Brightness / Contrast",
        "Adjusts the brightness and contrast of the image.",
        [
            { id: "brightness", min: 0, max: 10, step: 0.1 },
            { id: "contrast", min: 0, max: 10, step: 0.1 },
        ]
    ],
    "saturationGamma": [
        "Saturation / Gamma",
        "Adjusts the saturation and gamma of the image.",
        [
            { id: "saturation", min: 0, max: 10, step: 0.1 },
            { id: "gamma", min: 0, max: 10, step: 0.1 },
        ]
    ],
    "colorChannel": [
        "Color-channel",
        "Shifts the color channel and alpha of the image.",
        [
            { id: "red", min: 0, max: 10, step: 0.1 },
            { id: "green", min: 0, max: 10, step: 0.1 },
            { id: "blue", min: 0, max: 10, step: 0.1 },
            { id: "alpha", min: 0, max: 10, step: 0.1 },
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
        const nodeBuilder = context.instantiate(String.raw`Blink/Input`, "inputImage");
        nodeBuilder.setTitle("Blink Image");
        nodeBuilder.setDescription("Input a Blink Sprite Image");

        const ui = nodeBuilder.createUIBuilder();
        ui.addCachePicker({
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
            let src = uiInput["imagePicker"];

            const canvas = {
                assets: {
                    [uiInput["state"]["id"]]: {
                        class: "asset",
                        type: "image",
                        data: uiInput["imagePicker"]
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
        const nodeBuilder = context.instantiate("Blink/Input", "inputShape");
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
        }, {});
        ui.addColorPicker({
            componentId: "stroke",
            label: "Stroke",
            defaultValue: "#00000000",
            triggerUpdate: true,
        }, {});
        ui.addSlider({
            componentId: "strokeWidth",
            label: "Stroke Width",
            defaultValue: 0,
            triggerUpdate: true,
        }, { min: 0, max: 100, set: 0.1 });

        addTweakability(ui);

        nodeBuilder.define(async (input, uiInput, from) => {
            const canvas = {
                assets: {},
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
                            strokeWidth: uiInput["strokeWidth"],
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
    "curve": (context) => {
        const nodeBuilder = context.instantiate("Blink/Input", "curve");
        nodeBuilder.setTitle("Blink Curve");
        nodeBuilder.setDescription("Draw a custom curve");

        const ui = nodeBuilder.createUIBuilder();
        ui.addDropdown({
            componentId: "drawMode",
            label: "Draw Mode",
            defaultValue: "normal",
            triggerUpdate: true,
        }, {
          options: {
            "Normal": "normal",
          }
        })
        const getTransform = addTransformInput(ui, ["position", "rotation", "scale"]);

        ui.addColorPicker({
            componentId: "fill",
            label: "Fill",
            defaultValue: "#00000000",
            triggerUpdate: true,
        }, {});
        ui.addColorPicker({
            componentId: "stroke",
            label: "Stroke",
            defaultValue: "#000000",
            triggerUpdate: true,
        }, {});
        ui.addSlider({
            componentId: "strokeWidth",
            label: "Stroke Width",
            defaultValue: 1,
            triggerUpdate: true,
        }, { min: 0, max: 100, set: 0.1 });

        ui.addBuffer({
                componentId: "curve",
                label: "Curve Buffer",
                defaultValue: { id: "", path: [] },
                triggerUpdate: true,
            }, {}
        );

        addTweakability(ui);

        nodeBuilder.setUIInitializer((x) => {
            return {
                curve: {
                    id: getUUID(),
                    path: [
                        {
                            control1: { x: 50, y: 10 },
                            control2: { x: 10, y: 300 },
                            point: { x: 0, y: 0 },
                        },
                        {
                            control1: { x: 50, y: 10 },
                            control2: { x: 10, y: 300 },
                            point: { x: 400, y: 400 },
                        },
                        {
                            control1: { x: 400, y: 500 },
                            control2: { x: 10, y: 500 },
                            point: { x: 50, y: 10 },
                        },
                    ]
                }
            };
        });

        nodeBuilder.define(async (input, uiInput, from) => {
            const canvas = {
                assets: {
                    [uiInput["curve"]["id"]]: {
                        class: "asset",
                        type: "curve",
                        data: uiInput["curve"].path
                    }
                },
                content: {
                    class: "clump",
                    nodeUUID: uiInput["tweaks"].nodeUUID,
                    changes: uiInput["diffs"]?.uiInputs ?? [],
                    transform: getTransform(uiInput),
                    elements: [
                        {
                            class: "atom",
                            type: "curve",
                            assetId: uiInput["curve"].id,

                            fill: colorHexToNumber(uiInput["fill"]),
                            fillAlpha: colorHexToAlpha(uiInput["fill"]),
                            stroke: colorHexToNumber(uiInput["stroke"]),
                            strokeAlpha: colorHexToAlpha(uiInput["stroke"]),
                            strokeWidth: uiInput["strokeWidth"],
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
    "inputText": (context) => {
        const nodeBuilder = context.instantiate("Blink/Input", "inputText");
        nodeBuilder.setTitle("Blink Text");
        nodeBuilder.setDescription("Input a Blink Text element");

        const ui = nodeBuilder.createUIBuilder();
        ui.addTextInput({
            componentId: "text",
            label: "Text",
            defaultValue: "input text",
            triggerUpdate: true,
        }, {});

        ui.addDropdown({
            componentId: "fontFamily",
            label: "Family",
            defaultValue: "Arial",
            triggerUpdate: true,
        }, {
          options: {
            "Arial": "Arial",
            "Consolas": "Consolas",
            "Courier New": "Courier New",
            "Georgia": "Georgia",
            "Helvetica": "Helvetica",
            "Impact": "Impact",
            "Times New Roman": "Times New Roman",
            "Trebuchet MS": "Trebuchet MS",
            "Verdana": "Verdana",
          }
        });

        ui.addNumberInput({
            componentId: "fontSize",
            label: "Size",
            defaultValue: 24,
            triggerUpdate: true,
        }, { step: 0.2, min: 0 });

        ui.addDropdown({
            componentId: "fontStyle",
            label: "Style",
            defaultValue: "normal",
            triggerUpdate: true,
        }, {
          options: {
            "Normal": "normal",
            "Italic": "italic",
          }
        });
        ui.addDropdown({
            componentId: "fontWeight",
            label: "Weight",
            defaultValue: "normal",
            triggerUpdate: true,
        }, {
          options: {
            "Normal": "normal",
            "Bold": "bold",
          }
        });
        ui.addDropdown({
            componentId: "textAlign",
            label: "Align",
            defaultValue: "center",
            triggerUpdate: true,
        }, {
          options: {
            "Left": "left",
            "Center": "center",
            "Right": "right"
          }
        });
        const getTransform = addTransformInput(ui, ["position", "rotation"]);

        ui.addColorPicker({
            componentId: "fill",
            label: "Fill",
            defaultValue: "#000000",
            triggerUpdate: true,
        }, {});
        ui.addColorPicker({
            componentId: "stroke",
            label: "Stroke",
            defaultValue: "#00000000",
            triggerUpdate: true,
        }, {});
        ui.addSlider({
            componentId: "strokeWidth",
            label: "Stroke Width",
            defaultValue: 0,
            triggerUpdate: true,
        }, { min: 0, max: 100, set: 0.1 });

        addTweakability(ui);

        nodeBuilder.define(async (input, uiInput, from) => {
            const canvas = {
                assets: {},
                content: {
                    class: "clump",
                    nodeUUID: uiInput["tweaks"].nodeUUID,
                    changes: uiInput["diffs"]?.uiInputs ?? [],
                    transform: getTransform(uiInput),
                    elements: [
                        {
                            class: "atom",
                            type: "text",

                            text: uiInput["text"],

                            fill: colorHexToNumber(uiInput["fill"]),
                            stroke: colorHexToNumber(uiInput["stroke"]),
                            strokeWidth: uiInput["strokeWidth"],
                            alpha: colorHexToAlpha(uiInput["fill"]),

                            fontSize: uiInput["fontSize"],
                            fontFamily: uiInput["fontFamily"],
                            fontStyle: uiInput["fontStyle"],
                            fontWeight: uiInput["fontWeight"],
                            textAlign: uiInput["textAlign"],
                            textBaseline: "alphabetic"
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
        const nodeBuilder = context.instantiate("Blink/Input", "matrix");
        nodeBuilder.setTitle("Matrix");
        nodeBuilder.setDescription("Construct a Blink matrix");

        const ui = nodeBuilder.createUIBuilder();
        ui.addMatrixInput(
            {
                componentId: "matrix",
                label: "Input matrix",
                defaultValue: [],
                triggerUpdate: true,
            },
            { rows: 3, cols: 3, step: 1 }
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": uiInput["matrix"]
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("vec2", "translation", "Translation");
        nodeBuilder.addInput("number", "rotation", "Rotation");
        nodeBuilder.addInput("vec2", "scale", "Scale");
        nodeBuilder.addOutput("Blink matrix", "res", "Result");
    },
    "layer": (context) => {
        const nodeBuilder = context.instantiate("Blink/Utils", "layer");
        nodeBuilder.setTitle("Layer");
        nodeBuilder.setDescription("Layer two or more Blink clumps. Clumps inputted at the beginning are placed on top in the canvas.");

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
        const nodeBuilder = context.instantiate("Blink/Utils", "filter");
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
    },
    "mask": (context) => {
        const nodeBuilder = context.instantiate("Blink/Utils", "mask");
        nodeBuilder.setTitle("Mask");
        nodeBuilder.setDescription("Mask a Blink clump with another clump");

        const ui = nodeBuilder.createUIBuilder();
        ui.addRadio({
            componentId: "maskEnabled",
            label: "Enabled",
            defaultValue: "enabled",
            triggerUpdate: true,
        }, {
          options: {
            "Enabled": "enabled",
            "Disabled": "disabled",
          }
        })

        nodeBuilder.define(async (input, uiInput, from) => {
            // Apply mask to outermost clump
            const canvas = input["clump"];
            if (uiInput["maskEnabled"] === "enabled" && input["mask"] != null) {
                canvas.content.mask = input["mask"].content;
            }

            return { "res": canvas };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump", "Clump");
        nodeBuilder.addInput("Blink clump", "mask", "Mask");
        nodeBuilder.addOutput("Blink clump", "res", "Result");
    },
    "canvasConfig": (context) => {
        const nodeBuilder = context.instantiate("Blink/Utils", "canvasConfig");
        nodeBuilder.setTitle("Canvas Config");
        nodeBuilder.setDescription("Configure the Blink canvas");

        const ui = nodeBuilder.createUIBuilder();
        ui.addTextInput({
            componentId: "exportName",
            label: "Export Name",
            defaultValue: "Blink Export",
            triggerUpdate: true,
        }, {});

        ui.addNumberInput(
            {
                componentId: "canvasW",
                label: "Canvas Width",
                defaultValue: 1920,
                triggerUpdate: true,
            },
            { step: 1 }
        );
        ui.addNumberInput(
            {
                componentId: "canvasH",
                label: "Canvas Height",
                defaultValue: 1080,
                triggerUpdate: true,
            },
            { step: 1 }
        );
        ui.addColorPicker({
            componentId: "canvasColor",
            label: "Canvas Background",
            defaultValue: "#ffffffff",
            triggerUpdate: true,
        }, {})

        nodeBuilder.define(async (input, uiInput, from) => {
            // Apply mask to outermost clump
            const canvas = {
                ...input["clump"],
                config: {
                    canvasDims: { w: uiInput["canvasW"], h: uiInput["canvasH"] },
                    canvasColor: colorHexToNumber(uiInput["canvasColor"]),
                    canvasAlpha: colorHexToAlpha(uiInput["canvasColor"]),

                    exportName: uiInput["exportName"]
                }
            }

            return { "canvas": canvas };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump", "Clump");
        nodeBuilder.addOutput("Blink canvas", "canvas", "Canvas");
    }
};
const commands = {};
const tiles = {};

function init(context) {

    const configurator = (data) => {
        return {
            displayType: "webview",
            props: {
                renderer: `${context.pluginId}/blinkRenderer`,
                media: null
            },
            contentProp: "media"
        };
    }

    const clumpTypeBuilder = context.createTypeclassBuilder("Blink clump");
    clumpTypeBuilder.setDisplayConfigurator(configurator);

    // clumpTypeBuilder.setToConverters({
    //     "image": (value) => ({})
    // });
    // clumpTypeBuilder.setFromConverters({
    //     "image": (value) => ({})
    // });

    const canvasTypeBuilder = context.createTypeclassBuilder("Blink canvas");
    canvasTypeBuilder.setDisplayConfigurator(configurator);
}

module.exports = {
    nodes,
    commands,
    tiles,
    init
};