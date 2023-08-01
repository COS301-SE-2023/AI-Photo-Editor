// Here we define node UIs and callbacks
const nodes = {
    "hello": (context) => {
        // Use context.nodeBuilder to construct the node UI
        nodeBuilder = context.instantiate("hello-plugin", "hello");
        nodeBuilder.setTitle("Gloria");
        nodeBuilder.setDescription("Provides a test slider and button and label for testing purposes, taking two string inputs and returning one string output");

        nodeBuilder.define((anchorInputs, uiInputs, requiredOutputs) => {
            // console.log(
            //     "------------------",
            //     "\nANCHOR INPUTS", anchorInputs,
            //     "\nUI INPUTS", uiInputs,
            //     "\nREQUIRED OUTPUTS", requiredOutputs
            // );

            // Doing it this way allows us to only compute the outputs that are required
            const computers = {
                "out1": () => anchorInputs["in1"] + anchorInputs["in2"],
                "out2": () => anchorInputs["in3"],
                "outSlider": () => uiInputs["slideAlong"],
                "outColorPicker": () => uiInputs["incarnadine"],
                "outKnob": () => uiInputs["yourAKnob"],
                "outDropdown": () => uiInputs["dropdown"],
                "outTextbox": () => uiInputs["mxitRevived"],
                "outFilePicker": () => uiInputs["diamondPick"]
            };

            let res = {};
            for (const output of requiredOutputs) {
                res = { ...res, [output]: computers[output]() }
            }

            // console.log("RETURNING", res);
            return res;
        });

        const ui = nodeBuilder.createUIBuilder();
        ui
        // addButton(config: UIComponentConfig, props: ComponentProps): NodeUIBuilder {
        .addButton({
            componentId: "order66",
            label: "Execute 66",
            defaultValue: "",
            updateBackend: true,
        }, {})

        // addSlider(config: UIComponentConfig, { min, max, step }: ComponentProps): NodeUIBuilder {
        .addSlider({
            componentId: "slideAlong",
            label: "Slide Along",
            defaultValue: 0,
            updateBackend: true,
        }, { min: 0, max: 100, set: 0.1 })

        // addColorPicker(config: UIComponentConfig, param: any): NodeUIBuilder {
        .addColorPicker({
            componentId: "incarnadine",
            label: "Multitudinous seas incarnadine",
            defaultValue: 0,
            updateBackend: true,
        }, {})

        // addKnob(config: UIComponentConfig, { min, max, step }: ComponentProps): NodeUIBuilder {
        .addKnob({
            componentId: "yourAKnob",
            label: "Your a knob",
            defaultValue: 0,
            updateBackend: true,
        }, { min: 0, max: 100, set: 0.1 })

        // addDropdown(config: UIComponentConfig, options: { [key: string]: any }): NodeUIBuilder {
        .addDropdown({
            componentId: "dropdown",
            label: "Rock",
            defaultValue: "Rock",
            updateBackend: true,
        }, {
            options: {
                "Rock": "Rock",
                "Paper": "Paper",
                "Scissors": "Scissors"
            }
        })

        // addTextInput(config: UIComponentConfig): NodeUIBuilder {
        .addTextInput({
            componentId: "mxitRevived",
            label: "dms",
            defaultValue: "some text here",
            updateBackend: true,
        }, {})

        // addTextInput(config: UIComponentConfig): NodeUIBuilder {
        .addFilePicker({
            componentId: "diamondPick",
            label: "So we back in the mine",
            defaultValue: "",
            updateBackend: true,
        }, {});

        // TODO:
        // - Label
        // - Radio
        // - Accordion
        // - NumberInput
        // - Checkbox
        // - FilePicker


        nodeBuilder.setUI(ui);

        // addInput(type: string, identifier: string, displayName: string)
        nodeBuilder.addInput("string", "in1", "In 1");
        nodeBuilder.addInput("string", "in2", "In 2");
        nodeBuilder.addInput("Number", "in3", "In 3");

        // addOutput(type: string, identifier: string, displayName: string)
        nodeBuilder.addOutput("string", "out1", "Concat");
        nodeBuilder.addOutput("Number", "out2", "Passthrough");
        nodeBuilder.addOutput("Number", "outSlider", "Slide along");
        nodeBuilder.addOutput("color",  "outColorPicker", "");
        nodeBuilder.addOutput("Number", "outKnob", "Your a knob");
        nodeBuilder.addOutput("string", "outDropdown", "");
        nodeBuilder.addOutput("string", "outTextbox", "");
        nodeBuilder.addOutput("string", "outFilePicker", "");
    }
    , "Jake": (context) => {
        nodeBuilder = context.instantiate("hello-plugin", "Jake");
        nodeBuilder.setTitle("Jake");
        nodeBuilder.setDescription("This is currently a useless node that does nothing.");

    }
}



// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    // "addBrightnessNode": (context) => {
    //     // TODO: Work this out
    //     // E.g. Could get context.command.inputs for instance for additional values

    //     context.setDescription("import a picture");

    //     context.setIcon("testing/image.jpg");

    //     context.addCommand(() => {
    //         console.log("Add Brightness Node");
    //     })

    //     context.setDisplayName("Add Brightness Node");

    //     return context.create();
    // },
    // "import": (context) => {
    //     // TODO: Work this out
    //     // E.g. Could get context.command.inputs for instance for additional values

    //     context.setDescription("import a picture");

    //     context.setIcon("testing/image.jpg");

    //     context.setDisplayName("Import Project");

    //     context.addCommand(() => {
    //         console.log("Import project");
    //     })

    //     return context.create();
    // },
    // "export": (context) => {
    //     // TODO: Work this out
    //     // E.g. Could get context.command.inputs for instance for additional values

    //     context.setDescription("import a picture");

    //     context.setIcon("testing/image.jpg");

    //     context.setDisplayName("Export project");

    //     context.addCommand(() => {
    //         console.log("Export picture");
    //     })

    //     return context.create();
    // }
}

// Here we define custom tiles for the UI
const tiles = {
    "helloTile": (context) => {
        // Use context.tileBuilder to construct the tile UI
    }
}

module.exports = {
    nodes,
    commands,
    tiles
};