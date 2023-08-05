// Use UI input if anchor not defined
function chooseInput(input, uiInput, inputKey) {
    if (input[inputKey]) {
        return input[inputKey];
    }
    return uiInput[inputKey];
}

const nodes = {
    "brightnessContrast": (context) => {
        const nodeBuilder = context.instantiate("glfx-plugin", "brightnessContrast");
        nodeBuilder.setTitle("Brightness / Contrast");
        nodeBuilder.setDescription("Adjust the brightness and contrast of the image");

        const ui = nodeBuilder.createUIBuilder();
        ui.addSlider(
            {
                componentId: "brightness",
                label: "Brightness",
                defaultValue: 0,
                updateBackend: true,
            },
            { min: -1, max: 1, step: 0.05 }
        );
        ui.addSlider(
            {
                componentId: "contrast",
                label: "Contrast",
                defaultValue: 0,
                updateBackend: true,
            },
            { min: -1, max: 1, step: 0.05 }
        );

        nodeBuilder.define(async (input, uiInput, from) => {
            return {
                "res": {
                    src: input["img"]?.src,
                    ops: [
                        ...(input["img"]?.ops || []),
                        {
                            type: "brightnessContrast",
                            args: [ 
                                chooseInput(input, uiInput, "brightness"),
                                chooseInput(input, uiInput, "contrast"),
                            ]
                        }
                    ]
                }
            }
        });

        nodeBuilder.setUI(ui);
        nodeBuilder.addInput("GLFX image", "img", "GLFX Image");
        nodeBuilder.addInput("Number", "brightness", "Brightness");
        nodeBuilder.addInput("Number", "contrast", "Contrast");
        nodeBuilder.addOutput("GLFX image", "res", "Result");
    },
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
            updateBackend: true,
        }, {});

        nodeBuilder.setUI(ui);

        nodeBuilder.addOutput("GLFX image", "res", "Result");
    },
}

const commands = {}
const tiles = {}

const types = {
    "GLFX": (context) => {
        const typeBuilder = context.instantiate();

        typeBuilder.setMediaHandler("glfxHandler"); // === "./dist/glfxHandler/index.html" in package.json

        // Define implicit returns
        typeBuidler.setLifts({
            // Number -> GLFX<Number>
            "Number": (value) => {},
            // string -> GLFX<string>
            "string": (value) => {}
        });

        // Define implicit flatmap
        // value: GLFX <({ [key: AnchorId]: any }, { [key: UIComponentId]: any })>
        // func: (anchorInputs: { [key: AnchorId]: any }, uiInputs: { [key: UIComponentId]: any }) => GLFX<{ [key: AnchorId]: any }>

        // result: GLFX<{ [key: AnchorId]: any }>
        typeBuilder.setBind((value, func) => {
        });
    }
}

module.exports = {
    nodes,
    commands,
    tiles
};