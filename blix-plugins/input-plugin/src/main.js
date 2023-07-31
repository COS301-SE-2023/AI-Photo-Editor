const nodes = {
    "inputNumber": (context) => {
        nodeBuilder = context.instantiate("input-plugin", "inputNumber");
        nodeBuilder.setTitle("Input number");
        nodeBuilder.setDescription("Provides a number input and returns a single number output");

        nodeBuilder.define((input, uiInput, from) => {
            return { "res": uiInput["number"] };
        });

        ui = nodeBuilder.createUIBuilder();
        ui
        .addSlider(
            {
                componentId: "number",
                label: "Input number",
                defaultValue: 0,
                updateBackend: true,
            },
            { min: 0, max: 100, set: 0.1 }
        );
        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("Number", "res", "Result");
    },
    "inputImage": (context) => {
        nodeBuilder = context.instantiate("input-plugin", "inputImage");
        nodeBuilder.setTitle("Input image");
        nodeBuilder.setDescription("Provides an image input and returns a single image output");

        nodeBuilder.define((input, uiInput, from) => {
            return { "res": uiInput["imagePicker"]};
        });

        ui = nodeBuilder.createUIBuilder();
        ui.addFilePicker({
            componentId: "imagePicker",
            label: "Pick an image",
            defaultValue: "",
            updateBackend: true,
        }, {});

        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("Image", "res", "Result");
    },
    // Will we define a color type? or just a vector4/string 
    "inputColor": (context) => {
        nodeBuilder = context.instantiate("input-plugin", "inputColor");
        nodeBuilder.setTitle("Input color");
        nodeBuilder.setDescription("Provides a color input and returns a single color output");

        nodeBuilder.define((input, uiInput, from) => {
            return { "res": uiInput["colorPicker"]};
        });

        ui = nodeBuilder.createUIBuilder();
        ui.addColorPicker({
            componentId: "colorPicker",
            label: "Pick a color",
            defaultValue: "red",
            updateBackend: true,
        }, {})
        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("color", "res", "Result");
    },
    // Will we define a color type? or just a vector4/string 
    "inputBoolean": (context) => {
        nodeBuilder = context.instantiate("input-plugin", "inputBoolean");
        nodeBuilder.setTitle("Input Boolean");
        nodeBuilder.setDescription("Provides a radio box and returns a single true/false value");

        nodeBuilder.define((input, uiInput, from) => {
            return { "res": uiInput["radio"]};
        });

        ui = nodeBuilder.createUIBuilder();
        ui.addColorPicker({
            componentId: "radio",
            label: "Pick a color",
            defaultValue: "red",
            updateBackend: true,
        }, {})
        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("color", "res", "Result");
    },
}


const commands = {}


const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};