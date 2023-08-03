const isProd = process.env.NODE_ENV === "production";
const sharp = require(isProd ? "../../../app.asar/node_modules/sharp" : "sharp")

const nodes = {
    "test": (context) => {
        nodeBuilder = context.instantiate("glfx-plugin", "test");
        nodeBuilder.setTitle("GLFX Test");
        nodeBuilder.setDescription("Just a test node while working on the GLFX plugin");
const ui = nodeBuilder.createUIBuilder();
        ui.addSlider(
            {
                componentId: "value",
                label: "Value",
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
                return { "res": await input["img"].modulate({ brightness: uiInput["value"] }) }
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("Sharp", "img", "Img");
        nodeBuilder.addInput("Number", "value", "Value");
        nodeBuilder.addOutput("Number", "res", "Result");
    }
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};