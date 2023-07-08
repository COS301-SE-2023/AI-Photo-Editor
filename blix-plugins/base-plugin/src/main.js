// Here we define node UIs and callbacks
// import fs from "fs";
// import { dialog } from "electron";
const nodes = { 
    // "hello": (context) => {
    //     // Use context.nodeBuilder to construct the node UI
    //     nodeBuilder = context.instantiate("hello-plugin","hello");
    //     nodeBuilder.setTitle("Gloria");
    //     nodeBuilder.define(() => {
    //         console.log("konnichi~wa");
    //     });

    //    ui =  nodeBuilder.createUIBuilder();
    //    ui.addButton("Execute order 66","return 66;").addSlider("Slide along",0,100,0.1,50).addDropdown("Orphanage",nodeBuilder.createUIBuilder()
    //    .addLabel("Label1"));   

    //    nodeBuilder.addInput("string", "in1", "In1");
    //    nodeBuilder.addInput("string", "in2", "In2");

    //    nodeBuilder.addOutput("string", "out01", "Out1");

    // }
    // ,"Jake": (context) => {
    //     nodeBuilder = context.instantiate("hello-plugin","Jake");
    //     console.log("Jake");
    // }
}



// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    
    "open": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Open a project");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Open Project");

        context.addCommand(() => {
            context.loadProject("openFile");
        })

        return context.create();
    },
    "saveas": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Save project to user storage");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Save project as...");

        // Very unsafe, but just for proof of concept
        context.addCommand((options) => {
            // console.log("Save project as...");
            context.saveCurrentProject(options.data);
            // console.log(options.data);
        })

        return context.create();
    },
    "send-prompt": (context) => {
        context.setDescription("Send a user prompt to the ai");
        context.setIcon("testing/image.jpg");

        context.setDisplayName("AI prompt");

        context.addCommand((options) => {
            context.sendPrompt(options.data);
        })

        return context.create();
    },
}

// Here we define custom tiles for the UI
const tiles = {
    // "helloTile": (context) => {
    //     // Use context.tileBuilder to construct the tile UI
    // }
}

module.exports = {
    nodes,
    commands,
    tiles
};