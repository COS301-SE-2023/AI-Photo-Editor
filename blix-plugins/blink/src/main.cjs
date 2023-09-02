const { kMaxLength } = require("buffer");
const crypto = require("crypto");

function getUUID() {
    return crypto.randomBytes(32).toString("base64url");
}

const nodes = {
    "inputSprite": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "inputSprite");
        nodeBuilder.setTitle("Blink Image");
        nodeBuilder.setDescription("Input a Blink Sprite Image");

        const ui = nodeBuilder.createUIBuilder();
        ui.addFilePicker({
            componentId: "imagePicker",
            label: "Pick an image",
            defaultValue: "",
            triggerUpdate: true,
        }, {})
        ui.addBuffer({
                componentId: "state",
                label: "State Buffer",
                defaultValue: { id: null },
                triggerUpdate: true,
            }, {}
        );

        nodeBuilder.setUIInitializer((x) => {
            console.log("UI INITIALIZER", x);
            return {
                state: {
                    id: getUUID(),
                }
            };
        });

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                res: {
                    images: {
                        "asdjfkljasdf": uiInput["imagePicker"]
                    },
                    sprites: {
                        "jkfddasjkf": {
                            image: "asdjfkljasdf",
                            transform: {
                                translation: [0, 0],
                                rotation: 0,
                                scale: [1, 1]
                            }
                        }
                    }
                }
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink matrix", "transform", "Transform");
        nodeBuilder.addOutput("Blink image", "res", "Result");
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
            { min: -100, max: 100, set: 0.1 }
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
    "testNode": (context) => {
        const nodeBuilder = context.instantiate(context.pluginId, "testNode");
        nodeBuilder.setTitle("Test Node");
        nodeBuilder.setDescription("Test node for blink");

        const ui = nodeBuilder.createUIBuilder();
        ui.addBuffer(
            {
                componentId: "state",
                label: "State Buffer",
                defaultValue: { test: "asdf", test2: [3, 1, 4, 1, 5, 9], test3: { test4: "test5" } },
                triggerUpdate: true,
            },
            {}
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            return { "res": {} }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Blink image", "img", "GLFX image");
        nodeBuilder.addInput("number", "number", "number");
        nodeBuilder.addOutput("Blink image", "res", "Result");
    }
};
const commands = {};
const tiles = {};

function init(context) {

    const glfxTypeBuilder = context.createTypeclassBuilder("Blink image");
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