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

function createThrelteNode(type, title, desc, params) {
    return (context) => {
        const nodeBuilder = context.instantiate("Threlte", type);
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
            nodeBuilder.addOutput("number", type, toTitleCase(param.id));
        }
        nodeBuilder.addOutput("GLFX image", "res", "Result");
    };
}

const glfxNodes = {
    "addPrimitive": [ 
        "Add Primitive",
        "Add a 3D primitive",
        []
    ],
};

// Object.keys(glfxNodes).forEach((key) => {
//     glfxNodes[key] = createGLFXNode(key, ...glfxNodes[key]);
// });

const nodes = {
    // ...glfxNodes,

    // "inputGLFXImage": (context) => {
    //     const nodeBuilder = context.instantiate("Input/Other", "inputGLFXImage");
    //     nodeBuilder.setTitle("Input GLFX image");
    //     nodeBuilder.setDescription("Provides an image input and returns a single image output");

    //     nodeBuilder.define(async (input, uiInput, from) => {
    //         return { "res": { src: uiInput["imagePicker"] } };
    //     });

    //     const ui = nodeBuilder.createUIBuilder();
    //     ui.addFilePicker({
    //         componentId: "imagePicker",
    //         label: "Pick an image",
    //         defaultValue: "",
    //         triggerUpdate: true,
    //     }, {});
    //     // ui.addCachePicker({
    //     //     componentId: "cacheid",
    //     //     label: "Pick an image",
    //     //     defaultValue: "",
    //     //     triggerUpdate: true,
    //     // }, {})

    //     nodeBuilder.setUI(ui);

    //     nodeBuilder.addOutput("GLFX image", "res", "Result");
    // },
}

const commands = {}
const tiles = {}

const types = {}

module.exports = {
    nodes,
    commands,
    tiles
};