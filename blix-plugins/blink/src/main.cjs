const crypto = require("crypto");

function getUUID() {
    return crypto.randomBytes(16).toString("base64url");
}

const nodes = {
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
        }, {})
        for (let numInp of ["position X", "position Y", "rotation", "scale X", "scale Y"]) {
            ui.addNumberInput(
                {
                    componentId: numInp.replace(" ", ""),
                    label: numInp[0].toUpperCase() + numInp.slice(1),
                    defaultValue: 0,
                    triggerUpdate: true,
                },
                {}
            );
        }
        ui.addBuffer({
                componentId: "state",
                label: "State Buffer",
                defaultValue: { id: null },
                triggerUpdate: true,
            }, {}
        );

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
                        data: src
                    }
                },
                content: {
                    class: "clump",
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
        for (let numInp of ["position X", "position Y", "rotation", "scale X", "scale Y"]) {
            ui.addNumberInput(
                {
                    componentId: numInp.replace(" ", ""),
                    label: numInp[0].toUpperCase() + numInp.slice(1),
                    defaultValue: 0,
                    triggerUpdate: true,
                },
                {}
            );
        }
        ui.addSlider(
            {
                componentId: "opacity",
                label: "Opacity",
                defaultValue: 100,
                triggerUpdate: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );
        // TODO: transform

        nodeBuilder.define(async (input, uiInput, from) => {
            // Apply filter to outermost clump
            const clumps = [1, 2, 3].map(n => input["clump" + n]).filter(c => c != null);

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
                transform: {
                    position: { x: uiInput["positionX"], y: uiInput["positionY"] },
                    rotation: uiInput["rotation"],
                    scale: { x: uiInput["scaleX"], y: uiInput["scaleY"] },
                },
                opacity: uiInput["opacity"],
                elements: clumps.map(c => c.content)
            }

            return { "res": { assets, content: parent } };
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink clump", "clump1", "Clump 1");
        nodeBuilder.addInput("Blink clump", "clump2", "Clump 2");
        nodeBuilder.addInput("Blink clump", "clump3", "Clump 3");
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
            "Blur": "blur",
            "Noise": "noise",
            "Color": "color",
          }
        })
        .addSlider(
            {
                componentId: "strength",
                label: "Strength",
                defaultValue: 0,
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
                params: [uiInput["strength"], ...(uiInput["filter"] === "blur" ? [25] : [])],
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